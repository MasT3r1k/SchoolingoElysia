import { Generated } from "kysely";

export interface StudentMatrikaTable {
    student_id: number;
    highest_education_id: number | null;
    previous_school_izo: string | null;
    study_type_code: string | null;
    financing_code: string | null;
    start_reason_code: string | null;
    end_reason_code: string | null;
    individual_plan_code: string | null;
    special_needs_code: string | null;
    language_code: string | null;
    health_status_code: string | null;
    updated_at: Generated<Date>;
}
