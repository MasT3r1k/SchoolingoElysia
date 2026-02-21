import { db } from '../../database';
import { degree } from './format_person_by_id';

export async function format_people_by_ids(person_ids: number[]): Promise<string[]> {
  if (!person_ids || person_ids.length === 0) return [];

  // NÁHRADOU ZA jednotlivé selecty uděláme GROUPED query
  const persons = await db
    .selectFrom('persons')
    .select(['person_id', 'first_name', 'last_name'])
    .where('person_id', 'in', person_ids)
    .execute();

  // degrees per person
  const degrees_raw = await db
    .selectFrom('persons_degree')
    .select(['person_id', 'degree_id'])
    .where('person_id', 'in', person_ids)
    .execute();

  // všechny degree z tabulky degrees
  const all_degree_ids = degrees_raw.map((d) => Number(d.degree_id)).filter((n) => !isNaN(n));

  const degrees = all_degree_ids.length
    ? await db
        .selectFrom('degrees')
        .select(['degree_id', 'is_before', 'shortcut', 'weight'])
        .where('degree_id', 'in', all_degree_ids)
        .execute()
    : [];

  // degreeID → objekt degree
  const degreeMap = new Map<number, any>();
  degrees.forEach((d) => degreeMap.set(d.degree_id, d));

  // personId → array degreeIDs
  const personDegreeMap = new Map<number, number[]>();
  degrees_raw.forEach((row) => {
    const p = row.person_id;
    const degId = Number(row.degree_id);
    if (!personDegreeMap.has(p)) personDegreeMap.set(p, []);
    if (!isNaN(degId)) personDegreeMap.get(p)!.push(degId);
  });

  // FINÁLNÍ VÝSTUP
  const formatted: string[] = [];

  for (const person of persons) {
    const fullName = `${person.first_name} ${person.last_name}`;

    const degIds = personDegreeMap.get(person.person_id) || [];
    if (degIds.length === 0) {
      formatted.push(fullName);
      continue;
    }

    const degrees_for_person = degIds
      .map((id) => degreeMap.get(id))
      .filter((d): d is degree => Boolean(d))
      .sort((a, b) => a.weight - b.weight);

    let text = '';

    // tituly před
    for (const d of degrees_for_person) {
      if (d.is_before) text += `${d.shortcut} `;
    }

    text += fullName;

    // tituly za
    for (const d of degrees_for_person) {
      if (!d.is_before) text += `, ${d.shortcut}`;
    }

    formatted.push(text);
  }

  return formatted;
}

export async function format_person_map_by_ids(person_ids: number[]): Promise<Map<number, string>> {
  if (!person_ids || person_ids.length === 0) return new Map();

  // Deduplicate IDs
  const unique_ids = [...new Set(person_ids)];

  const persons = await db
    .selectFrom('persons')
    .select(['person_id', 'first_name', 'last_name'])
    .where('person_id', 'in', unique_ids)
    .execute();

  const degrees_raw = await db
    .selectFrom('persons_degree')
    .select(['person_id', 'degree_id'])
    .where('person_id', 'in', unique_ids)
    .execute();

  const all_degree_ids = degrees_raw.map((d) => Number(d.degree_id)).filter((n) => !isNaN(n));

  const degrees = all_degree_ids.length
    ? await db
        .selectFrom('degrees')
        .select(['degree_id', 'is_before', 'shortcut', 'weight'])
        .where('degree_id', 'in', all_degree_ids)
        .execute()
    : [];

  const degreeMap = new Map<number, any>();
  degrees.forEach((d) => degreeMap.set(d.degree_id, d));

  const personDegreeMap = new Map<number, number[]>();
  degrees_raw.forEach((row) => {
    const p = row.person_id;
    const degId = Number(row.degree_id);
    if (!personDegreeMap.has(p)) personDegreeMap.set(p, []);
    if (!isNaN(degId)) personDegreeMap.get(p)!.push(degId);
  });

  const resultMap = new Map<number, string>();

  for (const person of persons) {
    const fullName = `${person.first_name} ${person.last_name}`;
    const degIds = personDegreeMap.get(person.person_id) || [];
    
    if (degIds.length === 0) {
      resultMap.set(person.person_id, fullName);
      continue;
    }

    const degrees_for_person = degIds
      .map((id) => degreeMap.get(id))
      .filter((d): d is degree => Boolean(d))
      .sort((a, b) => a.weight - b.weight);

    let text = '';
    // tituly před
    for (const d of degrees_for_person) {
      if (d.is_before) text += `${d.shortcut} `;
    }
    text += fullName;
    // tituly za
    for (const d of degrees_for_person) {
      if (!d.is_before) text += `, ${d.shortcut}`;
    }

    resultMap.set(person.person_id, text);
  }

  return resultMap;
}
