export interface Student_rewardsTable {
  rewardId: number
  studentId: number
  reward: string
  amount: number | null
  teacherId: number
  created: string // timestamp
  isReceived: boolean
}