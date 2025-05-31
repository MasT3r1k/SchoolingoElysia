export interface messages_receiversTable {
  messageReceiverId: number;
  messageId: number;
  receiverId: number;
  status: 'sent' | 'delivered' | 'read';
}
