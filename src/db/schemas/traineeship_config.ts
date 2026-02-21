import { Generated } from "kysely"

export interface Traineeship_configTable {
  tr_config: Generated<number>
  is_activated: Generated<boolean>
  manager_id: Generated<number | null>
  default_ignore_days: Generated<string | null>
  allow_map: Generated<boolean>
}
