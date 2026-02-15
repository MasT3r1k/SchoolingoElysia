import { Generated } from "kysely";

export interface OnlineLessonsTable {
  lessonId: Generated<number>;
  school: number;
  title: string;
  description: string | null;
  start: Date;
  end: Date;
  platform: 'teams' | 'meet' | 'zoom' | 'other';
  link: string;
  teacher: number;
  target_type: 'class' | 'group' | 'student';
  target_id: number;
  subject_id: number | null;
  created_at: Generated<Date>;
}
