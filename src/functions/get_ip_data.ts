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

/**
 * Získá geografické informace o IP adrese
 * Používá několik fallback služeb pro maximální spolehlivost
 * @param ip - IP adresa k vyhledání
 * @returns Geografické informace nebo null hodnoty pokud selžou všechny služby
 */
export async function getIPData(ip: string) {
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

  // 1. Primární služba: ip-api.com (bezplatná, bez API klíče)
  try {
    const res = await fetchWithTimeout(`http://ip-api.com/json/${ip || ''}`, TIMEOUT_MS);
    const data = await res.json() as IpApiResponse;
    
    if (data.status === "success") {
      console.log('[IP Lookup] ip-api.com SUCCESS:', data);
      return {
        ip: data.query || ip,
        city: data.city ?? null,
        zip_code: data.zip ?? null,
        region_name: data.regionName ?? null,
        country: data.country ?? null,
        country_code: data.countryCode ?? null,
        continent: data.continent ?? null,
        continent_code: data.continentCode ?? null,
      };
    }
  } catch (e) {
    console.warn('[IP Lookup] ip-api.com failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // 2. Backup služba: ipapi.co (bezplatná, 1000 requestů/den)
  try {
    const res = await fetchWithTimeout(`https://ipapi.co/${ip || ''}/json/`, TIMEOUT_MS);
    const data = await res.json() as IpapiCoResponse;
    
    if (data.ip && !data.error) {
      console.log('[IP Lookup] ipapi.co SUCCESS:', data);
      return {
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
    console.warn('[IP Lookup] ipapi.co failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // 3. Třetí backup: ipwhois.app (bezplatná, 10000 requestů/měsíc)
  try {
    const res = await fetchWithTimeout(`http://ipwhois.app/json/${ip || ''}`, TIMEOUT_MS);
    const data = await res.json() as IpWhoisResponse;
    
    if (data.success) {
      console.log('[IP Lookup] ipwhois.app SUCCESS:', data);
      return {
        ip: data.ip || ip,
        city: data.city ?? null,
        zip_code: null, // ipwhois neposkytuje PSČ
        region_name: data.region ?? null,
        country: data.country ?? null,
        country_code: data.country_code ?? null,
        continent: data.continent ?? null,
        continent_code: data.continent_code ?? null,
      };
    }
  } catch (e) {
    console.warn('[IP Lookup] ipwhois.app failed:', e instanceof Error ? e.message : 'Unknown error');
  }

  // Všechny služby selhaly - vrátit fallback data
  console.error('[IP Lookup] All services failed, using fallback data with IP only');
  return fallbackData;
}