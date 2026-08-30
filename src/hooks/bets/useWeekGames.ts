'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Game, WeekInfo } from '@/types'

export function useWeekGames() {
  const [games, setGames] = useState<Game[]>([])
  const [week, setWeek] = useState<WeekInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games')

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(data.error || 'Falha ao buscar os jogos do nosso servidor')
        }

        const data = await response.json()

        if (!data.week) {
          throw new Error('Nenhuma semana de jogos ativa encontrada.')
        }

        setGames(data.events)
        setWeek(data.week)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.'
        setError(message)
        toast.error(message)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

  return {
    games,
    week,
    loading,
    error,
  }
}
