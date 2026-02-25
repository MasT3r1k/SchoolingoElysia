import { Generated } from "kysely";

export interface student_historyTable {
    student_history_id: Generated<number>;
    student_id: number;
    teacher_id: number;
    type: string;
    data: Generated<string>;
    created_at: Generated<Date>;
}

/*
CREATE TABLE `student_history` (
  `student_history_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `type` text NOT NULL,
  `data` text NOT NULL DEFAULT '{}',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
ALTER TABLE `student_history`
  ADD PRIMARY KEY (`student_history_id`);
ALTER TABLE `student_history`
  MODIFY `student_history_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
*/