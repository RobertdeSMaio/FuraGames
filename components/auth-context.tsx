"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { User } from '@/lib/types'
import { store } from '@/lib/store'

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
    // Check for existing session
    const currentUser = store.getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const loggedInUser = store.login(email, password)
    if (loggedInUser) {
      setUser(loggedInUser)
      return true
    }
    return false
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const newUser = store.register(name, email, password)
    if (newUser) {
      setUser(newUser)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    store.logout()
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
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
