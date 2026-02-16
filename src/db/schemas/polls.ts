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
  end: Date | null;
  time_limit: number | null;
  shuffle_questions: Generated<boolean>;
  shuffle_options: Generated<boolean>;
  show_results: Generated<boolean>;
  allow_review: Generated<boolean>;
  grade_column: Generated<number | null>;
  assign_by: number;
  assign_at: Generated<Date>;
}

export interface PollAssignRecipientsTable {
  poll_assign_recipient_id: Generated<number>;
  poll_assign_id: number;
  group_id: number;
  subject_id: number;
  assigned: Generated<boolean>;
}

export interface PollSharesTable {
  poll_share_id: Generated<number>;
  poll_id: number;
  person_id: number;
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
  poll_assign_id: Generated<number | null>;
  student_id: number
  started_at: Generated<Date>;
  submitted_at: Generated<Date | null>
  total_score: number | null
  total_max_score: number | null
  percentage: number | null
  metadata: string | null // JSON string
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
  selected_at: Generated<Date | null>
}

export interface PollResponseQuestionsTable {
  id: Generated<number>
  response_id: number
  question_id: number
  display_order: number
  options_order: string | null // JSON array
}
