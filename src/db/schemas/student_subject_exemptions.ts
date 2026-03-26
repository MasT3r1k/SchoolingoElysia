import { Generated } from "kysely";

export interface StudentSubjectExemptionsTable {
    exemption_id: Generated<number>;
    student_id: number;
    subject_id: number | null;
    valid_from: Date | null;
    valid_to: Date | null;
    note: string | null;
    created_by: number;
    created_at: Generated<Date>;
}
