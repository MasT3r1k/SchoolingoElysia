import { Generated } from "kysely";

export interface MigrationsTable {
    id: Generated<number>;
    name: string;
    applied_at: Generated<Date>;
}
