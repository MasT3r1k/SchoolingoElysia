import { Generated } from "kysely";

export interface StudentMatrikaRecordsTable {
    id: Generated<number>;
    student_id: number;
    type: string;
    description: string | null;
    valid_from: string | null;
    valid_to: string | null;
    created_at: Generated<Date>;
}
