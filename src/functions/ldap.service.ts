import { Client, Change, Attribute, type SearchOptions } from "ldapts";
import { Database } from "bun:sqlite";
import crypto from "node:crypto";
import { Elysia } from "elysia";

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard pro GCM
const AUTH_TAG_LENGTH = 16;
// Generujeme si v paměti klíč o délce přesně 32 bajtů pro AES-256-GCM
const ENCRYPTION_KEY = crypto.createHash('sha256').update(process.env.LDAP_SECRET || "default_schoolingo_ldap_secret_key").digest('base64').substring(0, 32);

function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText; // Není to šifrované v našem formátu
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = Buffer.from(parts[2], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Inicializace SQLite databáze běžící na file systému aplikaci k uchování LDAP konfigurace
const sqliteDb = new Database("ldap.sqlite", { create: true });

sqliteDb.query(`
    CREATE TABLE IF NOT EXISTS ldap_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        url TEXT NOT NULL,
        baseDN TEXT NOT NULL,
        bindUser TEXT NOT NULL,
        bindPassword TEXT NOT NULL,
        loginAttribute TEXT NOT NULL
    )
`).run();

// Seed s výchozími daty (pokud je tabulka prázdná)
const existingConfig = sqliteDb.query(`SELECT count(*) as count FROM ldap_config`).get() as { count: number };
if (existingConfig.count === 0) {
    sqliteDb.query(`
        INSERT INTO ldap_config (id, url, baseDN, bindUser, bindPassword, loginAttribute) 
        VALUES (1, 'ldap://192.168.0.240:389', 'dc=school,dc=local', 'administrator@school.local', $password, 'sAMAccountName')
    `).run({ $password: encrypt('Heslo123') });
}

export function getLdapConfig() {
    const row = sqliteDb.query(`SELECT * FROM ldap_config WHERE id = 1`).get() as any;
    if (!row) throw new Error("LDAP konfigurace nebyla nalezena");
    return {
        url: row.url,
        baseDN: row.baseDN,
        bindUser: row.bindUser,
        bindPassword: decrypt(row.bindPassword),
        loginAttribute: row.loginAttribute
    };
}

export function setLdapConfig(url: string, baseDN: string, bindUser: string, bindPasswordInput: string, loginAttribute: string) {
    sqliteDb.query(`
        INSERT OR REPLACE INTO ldap_config (id, url, baseDN, bindUser, bindPassword, loginAttribute) 
        VALUES (1, $url, $baseDN, $bindUser, $bindPassword, $loginAttribute)
    `).run({
        $url: url,
        $baseDN: baseDN,
        $bindUser: bindUser,
        $bindPassword: encrypt(bindPasswordInput),
        $loginAttribute: loginAttribute
    });
}

// ---------- ERROR MAP ----------
const adErrorMap: Record<string, string> = {
    "525": "Invalid username",
    "52e": "Invalid password",
    "530": "Access denied (time restriction)",
    "531": "Account not allowed to login from here",
    "532": "Password expired",
    "533": "Account disabled",
    "534": "Not authorized to login",
    "701": "Account expired",
    "773": "User must change password",
};

export function parseLdapError(err: any): string {
    console.log(err);
    const match = err?.message?.match(/data ([0-9a-fA-F]{3,})/);
    if (!match) return "Invalid password";
    const code = match[1].toLowerCase();
    return adErrorMap[code] || "Invalid password";
}

// ---------- LOGIN ----------
export async function ldapLogin(username: string, password: string) {
    const config = getLdapConfig();
    const client = new Client({
      url: config.url,
      timeout: 5000,
      connectTimeout: 5000
    });

  try {
    // 1) Přihlásíme se jako service účet
    await client.bind(config.bindUser, config.bindPassword);

    // 2) Najdeme DN skutečného usera
    const searchOptions: SearchOptions = {
      scope: 'sub' as const,
      filter: `(${config.loginAttribute}=${username})`,
      attributes: ['dn', 'cn', 'mail', 'sAMAccountName', 'memberOf']
    };

    const { searchEntries } = await client.search(config.baseDN, searchOptions);

    if (searchEntries.length === 0) {
      throw new Error('Uživatel nenalezen v AD');
    }

    const userDN = searchEntries[0].dn;

    // 3) Provedeme reálné přihlášení pomocí hesla uživatele
    const userClient = new Client({ url: config.url });
    await userClient.bind(userDN, password);
    await userClient.unbind(); // odpojení klienta uživatele

    // 4) Přihlášení OK → vrátíme data
    return {
      username: searchEntries[0].sAMAccountName,
      fullName: searchEntries[0].cn,
      email: searchEntries[0].mail,
      groups: searchEntries[0].memberOf || []
    };

  } finally {
    try { await client.unbind(); } catch {}
  }
}

// ---------- CHANGE PASSWORD ----------
export async function ldapChangePassword(username: string, oldPassword: string, newPassword: string) {
    const config = getLdapConfig();

    let isValidOldPassword = false;
    let isExpired = false;

    try {
        await ldapLogin(username, oldPassword);
        isValidOldPassword = true;
    } catch (err: any) {
        const errorMsg = parseLdapError(err);
        if (errorMsg === "Password expired" || errorMsg === "User must change password") {
            isValidOldPassword = true;
            isExpired = true;
        } else {
            throw new Error("Invalid old password");
        }
    }

    if (!isValidOldPassword) {
        throw new Error("Invalid old password");
    }

    const client = new Client({ 
        url: config.url,
        tlsOptions: { rejectUnauthorized: false }
    });

    try {
        if (config.url.startsWith("ldap://")) {
            try {
                await client.startTLS();
            } catch (err: any) {
                console.warn("Nezdařilo se aktivovat zabezpečené připojení STARTTLS, Active Directory typicky odmítne změnu hesla přes nezabezpečené spojení:", err.message || err);
            }
        }

        await client.bind(config.bindUser, config.bindPassword);

        const searchOptions: SearchOptions = {
            scope: "sub",
            filter: `(${config.loginAttribute}=${username})`,
            attributes: ["dn"],
        };
        const { searchEntries } = await client.search(config.baseDN, searchOptions);
        if (searchEntries.length === 0) throw new Error("Uživatel nenalezen v AD");

        const userDN = searchEntries[0].dn;

        const formattedPassword = `"${newPassword}"`;
        const encodedPassword = Buffer.from(formattedPassword, "utf16le");

        await client.modify(userDN, [
            new Change({
                operation: 'replace',
                modification: new Attribute({
                    type: "unicodePwd",
                    values: [encodedPassword],
                })
            })
        ]);
        
        if (isExpired) {
            await client.modify(userDN, [
                new Change({
                    operation: 'replace',
                    modification: new Attribute({
                        type: "pwdLastSet",
                        values: ["-1"]
                    })
                })
            ]);
        }
        
    } finally {
        try { await client.unbind(); } catch {}
    }
}

// ---------- ZÍSKÁNÍ LISTU VŠECH AD UŽIVATELŮ ----------
export async function ldapGetUsers() {
    const config = getLdapConfig();
    const client = new Client({ url: config.url });

    // Admin bind
    await client.bind(config.bindUser, config.bindPassword);

    const options: SearchOptions = {
        scope: "sub",
        // Filtr vrátí jen skutečné uživatele
        filter: "(&(objectClass=user)(!(objectClass=computer)))",
        attributes: ["cn", "sAMAccountName", "userPrincipalName", "mail", 'memberOf', 'msDS-UserPasswordExpiryTimeComputed'],
    };

    // Hledáme v celé doméně
    const { searchEntries } = await client.search(config.baseDN, options);

    await client.unbind();

    return searchEntries.map((u: any) => ({
        username: u.sAMAccountName,
        fullName: u.cn,
        email: u.mail,
        password_expire: u['msDS-UserPasswordExpiryTimeComputed'] ? Number((BigInt(u['msDS-UserPasswordExpiryTimeComputed']) - 116444736000000000n) / 10000n) : null,
        upn: u.userPrincipalName,
        groups: u.memberOf || []
    }));
}

// Export Elysia router (koncové body API)
export const ldapRoutes = new Elysia({ prefix: '/api/ldap' })
    .post("/login", async ({ body, set }: any) => {
        const { username, password } = body;

        if (!username || !password) {
            set.status = 400;
            return { error: "Vyplň uživatelské jméno a heslo" };
        }

        try {
            const user = await ldapLogin(username, password);
            return { success: true, user };
        } catch (err: any) {
            const errorMessage = parseLdapError(err);
            set.status = 401;
            return { success: false, error: errorMessage };
        }
    })
    .get("/users", async ({ set }: any) => {
        try {
            const users = await ldapGetUsers();
            return { success: true, users };
        } catch (err) {
            console.error(err);
            set.status = 500;
            return {
                success: false,
                error: "Nepodařilo se načíst uživatele z AD",
            };
        }
    });
