import { City } from "country-state-city";

const US_COUNTRY_CODE = "US";

function citiesForState(stateCode: string) {
  return City.getCitiesOfState(US_COUNTRY_CODE, stateCode.toUpperCase());
}

export function searchUsCities(
  stateCode: string,
  query: string,
  limit = 8,
): string[] {
  if (!/^[A-Za-z]{2}$/.test(stateCode)) {
    return [];
  }

  const normalizedQuery = query.trim().toLowerCase();
  const cities = citiesForState(stateCode);

  if (!normalizedQuery) {
    return cities.slice(0, limit).map((city) => city.name);
  }

  const startsWith: string[] = [];
  const contains: string[] = [];

  for (const city of cities) {
    const name = city.name;
    const lower = name.toLowerCase();

    if (lower.startsWith(normalizedQuery)) {
      startsWith.push(name);
    } else if (lower.includes(normalizedQuery)) {
      contains.push(name);
    }

    if (startsWith.length + contains.length >= limit * 2) {
      break;
    }
  }

  return [...startsWith, ...contains].slice(0, limit);
}

export function isUsCityInState(stateCode: string, cityName: string): boolean {
  const normalizedCity = cityName.trim().toLowerCase();
  if (!normalizedCity || !/^[A-Za-z]{2}$/.test(stateCode)) {
    return false;
  }

  return citiesForState(stateCode).some(
    (city) => city.name.toLowerCase() === normalizedCity,
  );
}
