import { db } from "../../database";
import { degree } from "./format_person_by_id";

export async function format_person(name: string, degree_ids: (string | number)[] = []): Promise<string> {
    // Převod všech ID na number
    const degreeIdsNumeric = degree_ids.map(id => Number(id)).filter(id => !isNaN(id));

    if (degreeIdsNumeric.length === 0) {
        return name;
    }

    const degrees = await db.selectFrom("degrees")
        .select([
            "degrees.degree",
            "degrees.is_before",
            "degrees.shortcut",
            "degrees.weight"
        ])
        .where("degree_id", "in", degreeIdsNumeric)
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
