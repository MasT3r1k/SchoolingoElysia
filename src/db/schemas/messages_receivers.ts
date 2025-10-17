import { Generated } from "kysely";

export interface messages_receiversTable {
  messageReceiverId: Generated<number>;
  messageId: number;
  receiverId: number;
  status: 'sent' | 'read';
}
