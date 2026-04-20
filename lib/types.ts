export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

export interface GameReview {
  id: string
  userId: string
  userName: string
  groupId?: string
  title: string
  platform: string
  genre: string
  rating: number
  hoursPlayed: number
  status: 'playing' | 'completed' | 'dropped' | 'on-hold' | 'want-to-play'
  review: string
  pros: string[]
  cons: string[]
  coverImage?: string
  createdAt: Date
  updatedAt: Date
}

export interface Group {
  id: string
  name: string
  description: string
  ownerId: string
  ownerName: string
  members: GroupMember[]
  inviteCode: string
  createdAt: Date
}

export interface GroupMember {
  userId: string
  userName: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: Date
}

export interface Invite {
  id: string
  groupId: string
  groupName: string
  invitedBy: string
  invitedEmail: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: Date
}
