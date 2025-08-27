'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import LogoHeader from '@/assets/LogoHeader.png'

export function Header() {
  const { user, logout, loading } = useAuth()
  const pathname = usePathname()

  return (
    <header className="w-full bg-surface text-text px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-25">
        <Link href="/">
          <Image
            src={LogoHeader}
            alt="Bolão Oval Logo"
            height={30}
            className="w-auto"
            priority
          />
        </Link>
        {user && (
          <nav className="hidden md:flex items-center gap-14">
            <Link href="/bets" className={`text-sm hover:text-primary transition-colors ${pathname === '/bets' ? 'text-primary font-bold' : 'text-muted'}`}>Apostas</Link>
            <Link href="/ranking" className={`text-sm hover:text-primary transition-colors ${pathname === '/ranking' ? 'text-primary font-bold' : 'text-muted'}`}>Ranking</Link>
          </nav>
        )}
      </div>
      {loading && (
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-5 w-32 rounded-md bg-zinc-700" />
          <div className="h-8 w-16 rounded-lg bg-zinc-700" />
        </div>
      )}

      {!loading && user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted">Olá, <strong>{user.name}</strong></span>
          <button
            onClick={logout}
            className="text-sm bg-primary hover:bg-primary-hover text-white px-4 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sair
          </button>
        </div>
      )}
    </header>
  )
}
