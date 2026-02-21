import { db } from '../../database';

export interface degree {
  degree: string;
  shortcut: string;
  is_before: boolean;
  weight: number;
}

export async function format_person_by_id(person_id: number): Promise<string> {
  const person = (
    await db
      .selectFrom('persons')
      .select(['first_name', 'last_name'])
      .where('persons.person_id', '=', person_id)
      .limit(1)
      .execute()
  )[0];
  const name = `${person.first_name} ${person.last_name}`;

  const degreesDB = await db
    .selectFrom('persons_degree')
    .select('degree_id')
    .where('person_id', '=', person_id)
    .execute();
  const degree_ids = degreesDB.map((degree) => degree.degree_id);

  // Převod všech ID na number
  const degreeIdsNumeric = degree_ids.map((id) => Number(id)).filter((id) => !isNaN(id));

  if (degreeIdsNumeric.length === 0) {
    return name;
  }

  const degrees = await db
    .selectFrom('degrees')
    .select(['degrees.degree', 'degrees.is_before', 'degrees.shortcut', 'degrees.weight'])
    .where('degree_id', 'in', degreeIdsNumeric)
    .execute();

  let text: string = '';

  const degrees_ordered = degrees.sort((a, b) => a.weight - b.weight);

  degrees_ordered.forEach((degree: degree) => {
    if (degree.is_before) {
      text += `${degree.shortcut} `;
    }
  });

  text += `${name}`;

  degrees_ordered.forEach((degree: degree) => {
    if (!degree.is_before) {
      text += `, ${degree.shortcut}`;
    }
  });

  return text;
}
