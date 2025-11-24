export async function getIPData(ip: string) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip ? ip : ''}`);
    const data = await res.json();
    console.log(data)

    if (data.status !== "success") {
      return null;
    }

    return {
        ip: data.query,
        city: data.city ?? null,
        zip_code: data.zip ?? null,
        region_name: data.regionName ?? null,
        country: data.country ?? null,
        country_code: data.countryCode ?? null,
        continent: data.continent ?? null,
        continent_code: data.continentCode ?? null
    };
  } catch (e) {
    return {
        ip: null,
        city: null,
        zip_code: null,
        region_name: null,
        country: null,
        country_code: null,
        continent: null,
        continent_code: null,
    };
  }
}