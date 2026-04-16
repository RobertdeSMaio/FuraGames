"use client"

import { User, GameReview, Group, Invite } from './types'

// Demo data
const demoUsers: User[] = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    createdAt: new Date('2024-01-01'),
  },
]

const demoReviews: GameReview[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Demo User',
    title: 'The Legend of Zelda: Tears of the Kingdom',
    platform: 'Nintendo Switch',
    genre: 'Action-Adventure',
    rating: 10,
    hoursPlayed: 120,
    status: 'completed',
    review: 'Uma obra-prima absoluta. A liberdade de criação e exploração é incomparável. O sistema Ultrahand revoluciona a forma de resolver puzzles.',
    pros: ['Gameplay inovador', 'Mundo imenso', 'Liberdade criativa', 'Gráficos lindos'],
    cons: ['Performance em algumas áreas', 'Durabilidade de armas'],
    coverImage: 'https://images.unsplash.com/photo-1566577134770-3d85bb3a9cc4?w=400&h=600&fit=crop',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: '2',
    userId: '1',
    userName: 'Demo User',
    title: 'Elden Ring',
    platform: 'PC',
    genre: 'Action RPG',
    rating: 9,
    hoursPlayed: 85,
    status: 'completed',
    review: 'O melhor jogo da FromSoftware. O mundo aberto funciona perfeitamente com a fórmula Souls. Desafiador mas justo.',
    pros: ['Mundo aberto incrível', 'Combate satisfatório', 'Lore profunda', 'Multijogador'],
    cons: ['Alguns bosses repetidos', 'Performance no PC'],
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '3',
    userId: '1',
    userName: 'Demo User',
    title: 'Baldur\'s Gate 3',
    platform: 'PC',
    genre: 'RPG',
    rating: 10,
    hoursPlayed: 150,
    status: 'completed',
    review: 'O padrão ouro dos RPGs. Escolhas significativas, personagens memoráveis e uma quantidade absurda de conteúdo.',
    pros: ['Narrativa excepcional', 'Liberdade de escolhas', 'Personagens incríveis', 'Co-op'],
    cons: ['Bugs ocasionais', 'Ato 3 mais curto'],
    coverImage: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
]

const demoGroups: Group[] = [
  {
    id: '1',
    name: 'RPG Enthusiasts',
    description: 'Grupo para amantes de RPGs de todos os tipos',
    ownerId: '1',
    ownerName: 'Demo User',
    members: [
      { userId: '1', userName: 'Demo User', role: 'owner', joinedAt: new Date('2024-01-01') },
    ],
    inviteCode: 'RPG2024',
    createdAt: new Date('2024-01-01'),
  },
]

// In-memory store (resets on refresh since no database)
let users = [...demoUsers]
let reviews = [...demoReviews]
let groups = [...demoGroups]
let invites: Invite[] = []
let currentUser: User | null = null

export const store = {
  // Auth
  login(email: string, password: string): User | null {
    const user = users.find(u => u.email === email)
    if (user) {
      currentUser = user
      return user
    }
    // Demo login
    if (email === 'demo@example.com' && password === 'demo') {
      currentUser = demoUsers[0]
      return demoUsers[0]
    }
    return null
  },

  register(name: string, email: string, password: string): User | null {
    if (users.find(u => u.email === email)) {
      return null
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date(),
    }
    users.push(newUser)
    currentUser = newUser
    return newUser
  },

  logout() {
    currentUser = null
  },

  getCurrentUser(): User | null {
    return currentUser
  },

  // Reviews
  getReviews(userId?: string, groupId?: string): GameReview[] {
    let filtered = reviews
    if (userId) {
      filtered = filtered.filter(r => r.userId === userId)
    }
    if (groupId) {
      filtered = filtered.filter(r => r.groupId === groupId)
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  addReview(review: Omit<GameReview, 'id' | 'createdAt' | 'updatedAt'>): GameReview {
    const newReview: GameReview = {
      ...review,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    reviews.push(newReview)
    return newReview
  },

  updateReview(id: string, updates: Partial<GameReview>): GameReview | null {
    const index = reviews.findIndex(r => r.id === id)
    if (index === -1) return null
    reviews[index] = { ...reviews[index], ...updates, updatedAt: new Date() }
    return reviews[index]
  },

  deleteReview(id: string): boolean {
    const index = reviews.findIndex(r => r.id === id)
    if (index === -1) return false
    reviews.splice(index, 1)
    return true
  },

  // Groups
  getGroups(userId?: string): Group[] {
    if (userId) {
      return groups.filter(g => g.members.some(m => m.userId === userId))
    }
    return groups
  },

  getGroup(id: string): Group | null {
    return groups.find(g => g.id === id) || null
  },

  createGroup(name: string, description: string, owner: User): Group {
    const newGroup: Group = {
      id: crypto.randomUUID(),
      name,
      description,
      ownerId: owner.id,
      ownerName: owner.name,
      members: [{ userId: owner.id, userName: owner.name, role: 'owner', joinedAt: new Date() }],
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: new Date(),
    }
    groups.push(newGroup)
    return newGroup
  },

  joinGroup(inviteCode: string, user: User): Group | null {
    const group = groups.find(g => g.inviteCode === inviteCode)
    if (!group) return null
    if (group.members.some(m => m.userId === user.id)) return group
    group.members.push({ userId: user.id, userName: user.name, role: 'member', joinedAt: new Date() })
    return group
  },

  leaveGroup(groupId: string, userId: string): boolean {
    const group = groups.find(g => g.id === groupId)
    if (!group) return false
    if (group.ownerId === userId) return false // Owner can't leave
    group.members = group.members.filter(m => m.userId !== userId)
    return true
  },

  deleteGroup(groupId: string, userId: string): boolean {
    const group = groups.find(g => g.id === groupId)
    if (!group || group.ownerId !== userId) return false
    groups = groups.filter(g => g.id !== groupId)
    reviews = reviews.filter(r => r.groupId !== groupId)
    return true
  },

  // Invites
  getInvites(userId: string): Invite[] {
    const user = users.find(u => u.id === userId)
    if (!user) return []
    return invites.filter(i => i.invitedEmail === user.email && i.status === 'pending')
  },

  sendInvite(groupId: string, invitedEmail: string, invitedBy: string): Invite | null {
    const group = groups.find(g => g.id === groupId)
    if (!group) return null
    const newInvite: Invite = {
      id: crypto.randomUUID(),
      groupId,
      groupName: group.name,
      invitedBy,
      invitedEmail,
      status: 'pending',
      createdAt: new Date(),
    }
    invites.push(newInvite)
    return newInvite
  },
}
