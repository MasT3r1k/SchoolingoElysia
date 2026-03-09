import { Generated } from 'kysely'

export interface MessageRecipientGroupTable {
  group_id: Generated<number>
  name: string
  author_id: number
  created_at: Generated<Date>
}

export interface MessageRecipientGroupMemberTable {
  group_id: number
  person_id: number
}
