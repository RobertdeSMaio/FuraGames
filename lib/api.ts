import { GameReview, Group, User, Invite } from './types'

// ─── helpers ─────────────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('furagames_token')
}

export function setToken(token: string) {
  localStorage.setItem('furagames_token', token)
}

export function clearToken() {
  localStorage.removeItem('furagames_token')
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`)
  return data as T
}

// ─── API surface ─────────────────────────────────────────────────────────────

export interface ReviewStats {
  total: number
  avgRating: number
  totalHours: number
  byStatus: Record<string, number>
  byPlatform: Record<string, number>
  byGenre: Record<string, number>
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ user: User; token: string }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'login', email, password }),
      }),

    register: (name: string, email: string, password: string) =>
      request<{ user: User; token: string }>('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ action: 'register', name, email, password }),
      }),

    me: () => request<{ user: User }>('/api/auth'),

    update: (data: { name?: string; avatar?: string }) =>
      request<{ user: User }>('/api/auth', { method: 'PUT', body: JSON.stringify(data) }),
  },

  reviews: {
    list: (params?: Partial<{ groupId: string; status: string; platform: string; genre: string; search: string }>) => {
      const q = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
      return request<{ reviews: GameReview[] }>(`/api/reviews${q}`)
    },

    get: (id: string) =>
      request<{ review: GameReview }>(`/api/reviews/${id}`),

    create: (data: Omit<GameReview, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'userName'>) =>
      request<{ review: GameReview }>('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<GameReview>) =>
      request<{ review: GameReview }>(`/api/reviews/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ message: string }>(`/api/reviews/${id}`, { method: 'DELETE' }),

    stats: () => request<ReviewStats>('/api/reviews/stats'),
  },

  groups: {
    list: () => request<{ groups: Group[] }>('/api/groups'),

    get: (id: string) => request<{ group: Group }>(`/api/groups/${id}`),

    create: (name: string, description: string) =>
      request<{ group: Group }>('/api/groups', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      }),

    join: (inviteCode: string) =>
      request<{ group: Group }>('/api/groups/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      }),

    update: (id: string, data: { name?: string; description?: string }) =>
      request<{ group: Group }>(`/api/groups/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    leave: (id: string) =>
      request<{ message: string }>(`/api/groups/${id}/leave`, { method: 'DELETE' }),

    delete: (id: string) =>
      request<{ message: string }>(`/api/groups/${id}`, { method: 'DELETE' }),

    invite: (groupId: string, email: string) =>
      request<{ invite: Invite }>(`/api/groups/${groupId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },

  invites: {
    list: () => request<{ invites: Invite[] }>('/api/invites'),

    accept: (id: string) =>
      request<{ message: string; group: Group }>(`/api/invites/${id}/accept`, { method: 'POST' }),

    decline: (id: string) =>
      request<{ message: string }>(`/api/invites/${id}/decline`, { method: 'POST' }),
  },
}
