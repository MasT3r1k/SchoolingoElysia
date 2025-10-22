import { db } from '../../database';

export interface degree {
  degree: string;
  shortcut: string;
  isBefore: boolean;
  weight: number;
}

export async function format_person_by_id(person_id: number): Promise<string> {
  const person = (
    await db
      .selectFrom('persons')
      .select(['firstName', 'lastName'])
      .where('persons.personId', '=', person_id)
      .limit(1)
      .execute()
  )[0];
  const name = `${person.firstName} ${person.lastName}`;

  const degreesDB = await db
    .selectFrom('persons_degree')
    .select('degree')
    .where('person', '=', person_id)
    .execute();
  const degree_ids = degreesDB.map((degree) => degree.degree);

  // Převod všech ID na number
  const degreeIdsNumeric = degree_ids.map((id) => Number(id)).filter((id) => !isNaN(id));

  if (degreeIdsNumeric.length === 0) {
    return name;
  }

  const degrees = await db
    .selectFrom('degrees')
    .select(['degrees.degree', 'degrees.isBefore', 'degrees.shortcut', 'degrees.weight'])
    .where('degreeID', 'in', degreeIdsNumeric)
    .execute();

  let text: string = '';

  const degrees_ordered = degrees.sort((a, b) => a.weight - b.weight);

  degrees_ordered.forEach((degree: degree) => {
    if (degree.isBefore) {
      text += `${degree.shortcut} `;
    }
  });

  text += `${name}`;

  degrees_ordered.forEach((degree: degree) => {
    if (!degree.isBefore) {
      text += `, ${degree.shortcut}`;
    }
  });

  return text;
}
