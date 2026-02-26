import { Generated } from "kysely";

export interface student_historyTable {
    student_history_id: Generated<number>;
    student_id: number;
    teacher_id: number;
    type: string;
    data: Generated<string>;
    created_at: Generated<Date>;
}