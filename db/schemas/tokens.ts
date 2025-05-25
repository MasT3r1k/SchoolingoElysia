export interface TokensTable {
  tokenId: number
  token: string
  password: number
  userAgent: string
  expires: string // datetime
  created: string // datetime
  userId: number
  socket: string | null
  ip: string | null
}