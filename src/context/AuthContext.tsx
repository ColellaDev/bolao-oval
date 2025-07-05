'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'

type User = {
  id: string
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => void
  fetchUser: () => Promise<void> 
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
  logout: () => {},
  fetchUser: async () => {}
})

type Props = {
  children: ReactNode
}

export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

   const fetchUser = async () => {
    try {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Erro ao buscar usuário logado:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const logout = async () => {
  try {
    await fetch('/api/logout', { method: 'POST' })
    setUser(null)
    window.location.href = '/login'
  } catch (error) {
    console.error('Erro ao fazer logout:', error)
  }
}

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}
