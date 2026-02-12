import { Generated, ColumnType } from 'kysely'

export interface PollsTable {
  id: Generated<number>
  title: string
  description: string | null
  type: 'feedback' | 'test'
  created_by: number
  created_at: ColumnType<Date, string | undefined, never>
  time_limit: number | null // in minutes
}

export interface PollAssignsTable {
  poll_assign_id: Generated<number>;
  poll_id: number;
  start: Generated<Date>;
  end: Generated<Date>;
  time_limit: Generated<number>;
  shuffle_questions: Generated<boolean>;
  shuffle_options: Generated<boolean>;
  show_results: Generated<boolean>;
  allow_review: Generated<boolean>;
  grade_column: Generated<number | null>;
  assign_by: number;
  assign_at: Generated<Date>;
}

export interface PollSharesTable {
  poll_share_id: Generated<number>;
  poll_id: number;
  user_id: number;
  is_valid: Generated<boolean>;
  added_at: Generated<Date>;
}

export interface PollQuestionsTable {
  id: Generated<number>
  poll_id: number
  title: string
  type: 'text' | 'single' | 'multiple'
  points: number
  order: number
}

export interface PollOptionsTable {
  id: Generated<number>
  question_id: number
  label: string
  is_correct: number // 0 or 1
  order: number
}

export interface PollResponsesTable {
  id: Generated<number>
  poll_id: number
  student_id: number
  started_at: ColumnType<Date, string | undefined, never>
  submitted_at: ColumnType<Date, string | undefined, string | undefined> | null
  total_score: number | null
  total_max_score: number | null
  percentage: number | null
}

export interface PollAnswersTable {
  id: Generated<number>
  response_id: number
  question_id: number
  answer_text: string | null
  option_id: number | null
  option_ids: string | null // JSON array of selected option IDs
  points_awarded: number | null
  is_manually_graded: number // 0 or 1
}
