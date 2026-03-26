import { Generated } from "kysely";

export interface StudentSubjectExemptionsTable {
    exemption_id: Generated<number>;
    student_id: number;
    subject_id: number | null;
    valid_from: string | null;
    valid_to: string | null;
    note: string | null;
    created_at: Generated<Date>;
}
