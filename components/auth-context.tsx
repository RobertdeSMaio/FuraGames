"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { User } from '@/lib/types'
import { api, setToken, clearToken } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('furagames_token') : null
    if (token) {
      api.auth.me()
        .then(({ user }) => setUser(user))
        .catch(() => clearToken())
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user, token } = await api.auth.login(email, password)
      setToken(token)
      setUser(user)
      return true
    } catch {
      return false
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const { user, token } = await api.auth.register(name, email, password)
      setToken(token)
      setUser(user)
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
