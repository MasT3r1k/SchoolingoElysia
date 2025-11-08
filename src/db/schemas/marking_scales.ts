import { Generated } from "kysely";

export interface marking_scalesTable {
    ms_id: Generated<number>
    teacher_id: number | null
    is_default: boolean
    name: string | null
    grade_1_min: number
    grade_2_min: number
    grade_3_min: number
    grade_4_min: number
    updated_at: Date
}
