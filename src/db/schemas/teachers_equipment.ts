import { Generated } from "kysely"

export interface TeachersEquipmentTable {
  id: Generated<number>
  person_id: number
  item_name: string
  serial_number: string | null
  handed_over_at: Generated<string | null>
  returned_at: string | null
  note: string | null
  created_at: Generated<Date>
}
