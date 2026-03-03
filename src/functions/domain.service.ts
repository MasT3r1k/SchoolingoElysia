import { db } from '../../database';
import { ConflictError, InternalServerError, NotFoundError } from '../utils/errors';
import bcrypt from 'bcryptjs';
import { sql } from 'kysely';
import { randomString } from './random_string';

export interface InstallationData {
    schoolName: string;
    domain: string;
    adminUsername: string;
    adminPassword: string;
    adminFirstName: string;
    adminLastName: string;
    adminEmail?: string;
    ico?: string;
    schoolShortName?: string;
    schoolType?: string;
    street?: string;
    city?: string;
    zip?: string;
    houseNumber?: string;
    orientationNumber?: string;
    districtId?: number;
    country?: number;
    redIzo?: string;
    izo?: string;
    schoolEmail?: string;
    schoolPhone?: string;
    schoolWeb?: string;
    databox?: string;
    director?: string;
    auth_classic?: boolean;
    auth_ldap?: boolean;
    auth_qr?: boolean;
    auth_passkeys?: boolean;
}

export class DomainService {
    
    /**
     * Get school ID by domain
     */
    async getSchoolByDomain(domain: string) {
        const mapping = await db.selectFrom('school_domains')
            .where('domain', '=', domain)
            .select('school_id')
            .executeTakeFirst();
        
        if (!mapping) return null;
        
        return await db.selectFrom('schools')
            .selectAll()
            .where('school_id', '=', mapping.school_id)
            .executeTakeFirst();
    }

    /**
     * Check if domain is available
     */
    async isDomainAvailable(domain: string): Promise<boolean> {
        const existing = await db.selectFrom('school_domains')
            .select('domain')
            .where('domain', '=', domain)
            .executeTakeFirst();
        return !existing;
    }

    /**
     * Install a new school
     */
    async installSchool(data: InstallationData) {
        // Validate domain availability
        if (!(await this.isDomainAvailable(data.domain))) {
            throw new ConflictError('Domain is already registered');
        }

        // We need a transaction for this multi-step process
        return await db.transaction().execute(async (trx) => {
            // 1. Create Password
            const hashedPassword = await bcrypt.hash(data.adminPassword, 10);
            const passwordRecord = await trx.insertInto('passwords')
                .values({
                    password: hashedPassword
                })
                .executeTakeFirstOrThrow();
            const passwordId = Number(passwordRecord.insertId);

            // 2. Create Person
            const personRecord = await trx.insertInto('persons')
                .values({
                    first_name: data.adminFirstName,
                    last_name: data.adminLastName,
                    birthday: null, 
                    birthplace_id: null,
                    gender: 0, // 0 = unknown/other
                    birthnum: null,
                    address_id: null,
                    insurance_id: null
                })
                .executeTakeFirstOrThrow();
            const personId = Number(personRecord.insertId);

            // 3. Create Email (if provided)
            if (data.adminEmail) {
                await trx.insertInto('emails')
                    .values({
                        person_id: personId,
                        email: data.adminEmail,
                        type: 'personal',
                        is_verified: true, // Auto-verify for admin setup
                        description: 'Admin Email'
                    })
                    .execute();
            }

            // 4. Create School
            const schoolRecord = await trx.insertInto('schools')
                .values({
                    name: data.schoolName,
                    short_name: data.schoolShortName || data.schoolName.substring(0, 10),
                    district_id: data.districtId || 0,
                    country_id: data.country || null,
                    code: randomString(6), 
                    owner_id: personId, // Link to admin person
                    total_storage_limit: 10737418240, 
                    apiToken: Bun.randomUUIDv7(),
                    license_type: 'FREE',
                    start_hour: 8,
                    start_minute: 0,
                    lesson_hour: 45,
                    break_time: 10,
                    reset_password_with_email: data.adminEmail ? true : false,
                    warningAbsencePercent: 20,
                    fastlogin: data.auth_qr ? true : false,
                    modules: 0,
                    studentsLimit: 100,
                    auth_classic: data.auth_classic === false ? 0 : 1,
                    auth_ldap: data.auth_ldap ? 1 : 0,
                    auth_passkeys: data.auth_passkeys ? 1 : 0,
                    session_lifetime_minutes: 120,
                    max_login_attempts: 5,
                    backup_interval: 24,
                    auto_update: 1, 
                    auto_update_interval: 24,
                    gdpr_first_name: data.adminFirstName,
                    gdpr_last_name: data.adminLastName,
                    gdpr_phone: data.schoolPhone || '',
                    gdpr_email: data.schoolEmail || data.adminEmail || '',
                    gdpr_mobile: '',
                    gdpr_databox: data.databox || '',
                    gdpr_web: data.schoolWeb || '',
                    red_izo: data.redIzo || '',
                    ico: data.ico || '',
                    school_type: data.schoolType || 'other',
                    izo: data.izo || ''
                } as any) 
                .executeTakeFirstOrThrow();
            
            const schoolId = Number(schoolRecord.insertId);

            // 5. Create Admin User
            const userRecord = await trx.insertInto('users')
                .values({
                    person_id: personId,
                    username: data.adminUsername,
                    password_id: passwordId,
                    login_type: 'local',
                    role: 'teacher',
                    manager: -1,
                    principal: true,
                    theme: 0,
                    locale: 'en',
                    password_changed: null,
                    recommend_change_password: false,
                    cookies: 0,
                    school_id: schoolId,
                    auto_select_next_week: true,
                    fastlogin: false,
                    levels_exp: 0,
                    '2fa': false,
                    '2fa_secret': null,
                    '2fa_activated': null,
                    avatar: '',
                })
                .executeTakeFirstOrThrow();
            
            const userId = Number(userRecord.insertId);

            // 6. Link Domain
            await trx.insertInto('school_domains')
                .values({
                    school_id: schoolId,
                    domain: data.domain
                })
                .execute();

            return { schoolId, userId };
        });
    }

    async getFromAres(ico: string) {
        try {
            // First try to get detailed school info from Rejstřík škol (RS)
            const rsResponse = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-rs/${ico}`);
            let rsData: any = null;
            if (rsResponse.ok) {
                const rsJson: any = await rsResponse.json();
                if (rsJson.zaznamy && rsJson.zaznamy.length > 0) {
                    rsData = rsJson.zaznamy[0];
                }
            }

            // Then get base info (including NACE codes for type detection)
            const baseResponse = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`);
            if (!baseResponse.ok && !rsData) return null;
            
            const baseData: any = baseResponse.ok ? await baseResponse.json() : {};
            
            // Merge data preference to RS for specific fields
            const finalData = {
                name: rsData?.obchodniJmeno || baseData.obchodniJmeno || '',
                shortName: rsData?.obchodniJmenoZkracene || '',
                ico: baseData.ico || rsData?.ico || ico,
                city: rsData?.sidlo?.nazevObce || baseData.sidlo?.nazevObce || '',
                street: rsData?.sidlo?.nazevUlice || baseData.sidlo?.nazevUlice || '',
                zip: rsData?.sidlo?.psc || baseData.sidlo?.psc || '',
                houseNumber: rsData?.sidlo?.cisloDomovni || baseData.sidlo?.cisloDomovni || '',
                orientationNumber: rsData?.sidlo?.cisloOrientacni || baseData.sidlo?.cisloOrientacni || '',
                czNace: baseData.czNace || [],
                redIzo: rsData?.redizo || '',
                izo: rsData?.skolyAZarizeni?.[0]?.izo || '',
                email: rsData?.kontakty?.email?.[0] || '',
                web: rsData?.kontakty?.www || '',
                director: rsData?.angazovanaOsoba?.find((o: any) => o.typAngazma.includes('REDITEL')) ? 
                          `${rsData.angazovanaOsoba.find((o: any) => o.typAngazma.includes('REDITEL')).titulPredJmenem || ''} ${rsData.angazovanaOsoba.find((o: any) => o.typAngazma.includes('REDITEL')).jmeno} ${rsData.angazovanaOsoba.find((o: any) => o.typAngazma.includes('REDITEL')).prijmeni}`.trim() : '',
                data: { ...baseData, rs: rsData }
            };

            return finalData;
        } catch (e) {
            console.error('ARES fetch error:', e);
            return null;
        }
    }

    async searchFromAres(query: string, start: number = 0, count: number = 20) {
        try {
            const isIco = /^\d{8}$/.test(query);
            
            let url = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat';
            let body: any;

            if (isIco) {
                // Use RS (Rejstřík škol) endpoint for IČO search (returns detailed school info)
                url = 'https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty-rs/vyhledat';
                body = {
                    ico: [query]
                };
            } else {
                // Use standard ARES endpoint for name search
                body = {
                    obchodniJmeno: query,
                    pocet: count,
                    start: start,
                    razeni: []
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) return null;
            const data: any = await response.json();
            
            if (isIco && data.ekonomickeSubjekty && data.ekonomickeSubjekty.length > 0) {
                // RS endpoint returns nested structure for IČO search:
                // { ekonomickeSubjekty: [ { icoId: "123", zaznamy: [ { obchodniJmeno: "..." } ] } ] }
                // We need to flatten this to return the actual school record
                return data.ekonomickeSubjekty.flatMap((item: any) => item.zaznamy || []);
            }

            return data.ekonomickeSubjekty || [];
        } catch (e) {
            console.error('ARES Search error:', e);
            return null;
        }
    }

    async searchFromIsv(query: string) {
        try {
            const today = '2026-02-18';
            const isIco = /^\d{8}$/.test(query);

            let body: any;
            if (isIco) {
                body = {
                    aplikace: "Schoolingo",
                    stavKeDni: today,
                    ico: [query],
                    zobrazit: "PLATNE"
                };
            } else {
                body = {
                    aplikace: "Schoolingo",
                    stavKeDni: today,
                    nazev: query,
                    pravniForma: [],
                    typZrizovatele: [],
                    spravniUrad: [],
                    adresaSubjektuKraj: [],
                    adresaSubjektuKrajLov: [],
                    adresaSubjektuOkres: [],
                    adresaSubjektuOkresLov: [],
                    adresaSubjektuObec: [],
                    druhSkoly: [],
                    vyucovaciJazykSkoly: [],
                    vyukaVCizimJazyce: "VSE",
                    ovm: "VSE",
                    skupinaOboru: [],
                    obor: [],
                    vyucovaciJazykOboru: [],
                    formaVzdelavani: [],
                    kategorieVzdelani: [],
                    delkaVzdelavani: [],
                    typMistaVyuky: [],
                    adresaMistaVyukyObec: [],
                    adresaMistaVyukyOkres: [],
                    adresaMistaVyukyOkresLov: [],
                    adresaMistaVyukyKraj: [],
                    adresaMistaVyukyKrajLov: [],
                    zobrazit: "PLATNE"
                };
            }

            const response = await fetch('https://isv.gov.cz/rssz/api/v1/sub/vyhledej', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) return null;
            const data: any = await response.json();
            return data.polozky || [];
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
export const domainService = new DomainService();
