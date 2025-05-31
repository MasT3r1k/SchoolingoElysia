import { Generated } from "kysely";

export interface messagesTable {
  messageId: Generated<number>;
  senderId: number;
  content: string;
  sentDate: Generated<Date>;
  readDate: Date | null;
}