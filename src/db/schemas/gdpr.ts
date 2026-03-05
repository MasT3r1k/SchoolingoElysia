import { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface GdprConsentsTable {
  id: Generated<number>
  title: string
  type: string
  description: string | null
  purpose: string | null
  instructions: string | null
  required: boolean
  active: boolean
  target_group: string | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export type GdprConsent = Selectable<GdprConsentsTable>
export type NewGdprConsent = Insertable<GdprConsentsTable>
export type GdprConsentUpdate = Updateable<GdprConsentsTable>

export interface GdprUserConsentsTable {
  id: Generated<number>
  user_id: number
  consent_id: number
  granted: boolean | null
  granted_at: Date | null
  expires_at: Date | null
  person_id: number | null // For parents granting for children
}

export type GdprUserConsent = Selectable<GdprUserConsentsTable>
export type NewGdprUserConsent = Insertable<GdprUserConsentsTable>
export type GdprUserConsentUpdate = Updateable<GdprUserConsentsTable>

export interface GdprTrainingTable {
  id: Generated<number>
  name: string
  description: string | null
  valid_days: number | null
  active: boolean
  target_group: string | null
  created_at: Generated<Date>
}

export type GdprTraining = Selectable<GdprTrainingTable>
export type NewGdprTraining = Insertable<GdprTrainingTable>

export interface GdprUserTrainingTable {
  id: Generated<number>
  user_id: number
  training_id: number
  status: 'not_started' | 'in_progress' | 'completed' | 'failed'
  score: number | null
  completed_at: Date | null
  expires_at: Date | null
}

export interface GdprRequestsTable {
  id: Generated<number>
  user_id: number
  type: 'export' | 'deletion'
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'expired' | 'rejected'
  requested_at: Generated<Date>
  completed_at: Date | null
  download_url: string | null
}

export interface GdprReportsTable {
  id: Generated<number>
  user_id: number
  type: 'breach' | 'objection'
  subject: string
  message: string
  status: 'new' | 'processing' | 'closed'
  created_at: Generated<Date>
}

export interface GdprReviewsTable {
  id: Generated<number>
  title: string
  description: string | null
  date: Date
  status: 'planned' | 'completed' | 'cancelled'
  result: string | null
  created_at: Generated<Date>
}
