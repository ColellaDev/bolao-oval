'use client'

import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="w-full bg-surface text-text px-6 py-4 flex justify-between items-center shadow-md">
      <h1 className="text-lg font-semibold text-primary">Bolão Oval</h1>

      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Olá, <strong>{user.name}</strong></span>
          <button
            onClick={logout}
            className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  )
}
