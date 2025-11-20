import { db } from '../../database';
import { degree } from './format_person_by_id';

export async function format_people_by_ids(person_ids: number[]): Promise<string[]> {
  if (!person_ids || person_ids.length === 0) return [];

  // NÁHRADOU ZA jednotlivé selecty uděláme GROUPED query
  const persons = await db
    .selectFrom('persons')
    .select(['personId', 'firstName', 'lastName'])
    .where('personId', 'in', person_ids)
    .execute();

  // degrees per person
  const degrees_raw = await db
    .selectFrom('persons_degree')
    .select(['person', 'degree'])
    .where('person', 'in', person_ids)
    .execute();

  // všechny degree z tabulky degrees
  const all_degree_ids = degrees_raw.map((d) => Number(d.degree)).filter((n) => !isNaN(n));

  const degrees = all_degree_ids.length
    ? await db
        .selectFrom('degrees')
        .select(['degreeID', 'isBefore', 'shortcut', 'weight'])
        .where('degreeID', 'in', all_degree_ids)
        .execute()
    : [];

  // degreeID → objekt degree
  const degreeMap = new Map<number, any>();
  degrees.forEach((d) => degreeMap.set(d.degreeID, d));

  // personId → array degreeIDs
  const personDegreeMap = new Map<number, number[]>();
  degrees_raw.forEach((row) => {
    const p = row.person;
    const degId = Number(row.degree);
    if (!personDegreeMap.has(p)) personDegreeMap.set(p, []);
    if (!isNaN(degId)) personDegreeMap.get(p)!.push(degId);
  });

  // FINÁLNÍ VÝSTUP
  const formatted: string[] = [];

  for (const person of persons) {
    const fullName = `${person.firstName} ${person.lastName}`;

    const degIds = personDegreeMap.get(person.personId) || [];
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
      if (d.isBefore) text += `${d.shortcut} `;
    }

    text += fullName;

    // tituly za
    for (const d of degrees_for_person) {
      if (!d.isBefore) text += `, ${d.shortcut}`;
    }

    formatted.push(text);
  }

  return formatted;
}
