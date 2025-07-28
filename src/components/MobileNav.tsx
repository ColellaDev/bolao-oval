'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Swords, Trophy } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-zinc-800 p-2 md:hidden z-50">
      <div className="flex justify-around items-center">
        <Link href="/bets" className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors w-24 ${pathname === '/bets' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
          <Swords className="h-6 w-6" />
          <span className="text-xs font-medium">Apostas</span>
        </Link>
        <Link href="/ranking" className={`flex flex-col items-center gap-1 p-2 rounded-md transition-colors w-24 ${pathname === '/ranking' ? 'text-primary' : 'text-muted hover:text-primary'}`}>
          <Trophy className="h-6 w-6" />
          <span className="text-xs font-medium">Ranking</span>
        </Link>
      </div>
    </nav>
  )
}
