import { db } from '../../database';
import moment from 'moment';
import { config } from '../config/app.config';

let publicIP: string | null = null;
let lastPublicIPFetch = 0;

// TypeScript interface pro různé IP API služby
interface IpApiResponse {
  status: string;
  query?: string;
  city?: string;
  zip?: string;
  regionName?: string;
  country?: string;
  countryCode?: string;
  continent?: string;
  continentCode?: string;
}

interface IpapiCoResponse {
  ip?: string;
  city?: string;
  postal?: string;
  region?: string;
  country_name?: string;
  country_code?: string;
  continent_code?: string;
  error?: boolean;
}

interface IpWhoisResponse {
  success: boolean;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  country_code?: string;
  continent?: string;
  continent_code?: string;
}

interface IpQueryResponse {
  ip: string;
  location?: {
    country: string;
    country_code: string;
    city: string;
    state: string;
    zipcode: string;
    latitude: number;
    longitude: number;
    timezone: string;
    localtime: string;
  };
  isp?: {
    asn: string;
    org: string;
    isp: string;
  };
  risk?: {
    is_mobile: boolean;
    is_vpn: boolean;
    is_tor: boolean;
    is_proxy: boolean;
    is_datacenter: boolean;
    risk_score: number;
  };
}

export async function getActualIP(ip: string | null): Promise<string | null> {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    // 1. Zkusíme config.DEV_IP
    if (config.DEV_IP) {
      console.log('[IP Lookup] Localhost detected, using DEV_IP from config:', config.DEV_IP);
      return config.DEV_IP;
    } 
    // 2. Zkusíme veřejnou IP stroje (pokud nebyla získána v posledních 30 minutách)
    if (!publicIP || (Date.now() - lastPublicIPFetch > 30 * 60 * 1000)) {
      try {
        const res = await fetch('https://api64.ipify.org?format=json');
        const data = await res.json() as { ip: string };
        if (data.ip) {
          publicIP = data.ip;
          lastPublicIPFetch = Date.now();
          console.log('[IP Lookup] Public IP detected for fallback:', publicIP);
        }
      } catch (e) {
        console.warn('[IP Lookup] Failed to fetch public IP for fallback.');
      }
    }
    if (publicIP) return publicIP;
  }
  return ip;
}

/**
 * Získá geografické informace o IP adrese
 * Používá několik fallback služeb pro maximální spolehlivost
 * @param ip - IP adresa k vyhledání
 * @returns Geografické informace nebo null hodnoty pokud selžou všechny služby
 */
export async function getIPData(ip: string | null) {
  ip = await getActualIP(ip);
  const fallbackData = {
    ip: ip || null,
    city: null,
    zip_code: null,
    region_name: null,
    country: null,
    country_code: null,
    continent: null,
    continent_code: null,
  };

  if (!ip || ip === '::1' || ip === '127.0.0.1') {
    return fallbackData;
  }

  // 0. Kontrola cache v databázi (platnost 30 dní)
  try {
    const cached = await db.selectFrom('ip_cache')
      .selectAll()
      .where('ip', '=', ip)
      .where('created', '>', moment().subtract(30, 'days').toDate())
      .executeTakeFirst();

    if (cached) {
      console.log('[IP Lookup] Cache HIT:', ip);
      return {
        ip: cached.ip,
        city: cached.city,
        zip_code: cached.zip_code,
        region_name: cached.region_name,
        country: cached.country,
        country_code: cached.country_code,
        continent: cached.continent,
        continent_code: cached.continent_code,
      };
    }
  } catch (cacheError) {
    console.warn('[IP Lookup] Cache read failed:', cacheError);
  }

  // Timeout pro každý request (3 sekundy)
  const TIMEOUT_MS = 3000;

  // Helper funkce pro fetch s timeoutem
  const fetchWithTimeout = async (url: string, timeout: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };

  let resultData = null;

  // 1. Primární služba: ipquery.io (Kompletně free s HTTPS podporou)
  try {
    const res = await fetchWithTimeout(`https://api.ipquery.io/${ip}`, TIMEOUT_MS);
    const data = await res.json() as IpQueryResponse;
    
    if (data.ip) {
      resultData = {
        ip: data.ip || ip,
        city: data.location?.city ?? null,
        zip_code: data.location?.zipcode ?? null,
        region_name: data.location?.state ?? null,
        country: data.location?.country ?? null,
        country_code: data.location?.country_code ?? null,
        continent: null, // ipquery.io neposkytuje kontinent přímo
        continent_code: null
      };
    }
  } catch (e) {
    console.warn('[IP Lookup] api.ipquery.io failed.');
  }

  // 2. Backup služba: ip-api.com
  if (!resultData) {
    try {
      const res = await fetchWithTimeout(`http://ip-api.com/json/${ip}`, TIMEOUT_MS);
      const data = await res.json() as IpApiResponse;
      
      if (data.status === "success") {
        resultData = {
          ip: data.query || ip,
          city: data.city ?? null,
          zip_code: data.zip ?? null,
          region_name: data.regionName ?? null,
          country: data.country ?? null,
          country_code: data.countryCode ?? null,
          continent: data.continent ?? null,
          continent_code: data.continentCode ?? null
        };
      }
    } catch (e) {
      console.warn('[IP Lookup] ip-api.com failed.');
    }
  }

  // 3. Backup služba: ipapi.co
  if (!resultData) {
    try {
      const res = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`, TIMEOUT_MS);
      const data = await res.json() as IpapiCoResponse;
      
      if (data.ip && !data.error) {
        resultData = {
          ip: data.ip || ip,
          city: data.city ?? null,
          zip_code: data.postal ?? null,
          region_name: data.region ?? null,
          country: data.country_name ?? null,
          country_code: data.country_code ?? null,
          continent: data.continent_code === 'EU' ? 'Europe' : 
                     data.continent_code === 'AS' ? 'Asia' : 
                     data.continent_code === 'AF' ? 'Africa' : 
                     data.continent_code === 'NA' ? 'North America' : 
                     data.continent_code === 'SA' ? 'South America' : 
                     data.continent_code === 'OC' ? 'Oceania' : 
                     data.continent_code === 'AN' ? 'Antarctica' : null,
          continent_code: data.continent_code ?? null,
        };
      }
    } catch (e) {
      console.warn('[IP Lookup] ipapi.co failed.');
    }
  }

  // 4. Třetí backup: ipwhois.app
  if (!resultData) {
    try {
      const res = await fetchWithTimeout(`http://ipwhois.app/json/${ip}`, TIMEOUT_MS);
      const data = await res.json() as IpWhoisResponse;
      
      if (data.success) {
        resultData = {
          ip: data.ip || ip,
          city: data.city ?? null,
          zip_code: null,
          region_name: data.region ?? null,
          country: data.country ?? null,
          country_code: data.country_code ?? null,
          continent: data.continent ?? null,
          continent_code: data.continent_code ?? null,
        };
      }
    } catch (e) {
      console.warn('[IP Lookup] ipwhois.app failed.');
    }
  }

  // Pokud jsme získali data, uložíme je do cache
  if (resultData) {
    try {
      await db.insertInto('ip_cache')
        .values({
          ip: resultData.ip,
          city: resultData.city,
          zip_code: resultData.zip_code,
          region_name: resultData.region_name,
          country: resultData.country,
          country_code: resultData.country_code,
          continent: resultData.continent,
          continent_code: resultData.continent_code,
        })
        .onDuplicateKeyUpdate({
          city: resultData.city,
          zip_code: resultData.zip_code,
          region_name: resultData.region_name,
          country: resultData.country,
          country_code: resultData.country_code,
          continent: resultData.continent,
          continent_code: resultData.continent_code,
          created: moment().toDate()
        })
        .execute();
      console.log('[IP Lookup] Cache updated for:', ip);
    } catch (saveError) {
      console.warn('[IP Lookup] Failed to save to cache:', saveError);
    }
    return resultData;
  }

  return fallbackData;
}
