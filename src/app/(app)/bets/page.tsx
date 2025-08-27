'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Game, WeekInfo } from '@/types'
import { GameCard } from '@/components/GameCard'
import { useAuth } from '@/hooks/useAuth'

export default function BetFormPage() {
  const [games, setGames] = useState<Game[]>([])
  const [week, setWeek] = useState<WeekInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [palpites, setPalpites] = useState<{ [key: string]: string }>({}) 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const { user } = useAuth()
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games')
        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(
            data.error || 'Falha ao buscar os jogos do nosso servidor',
          )
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

  useEffect(() => {
    if (!user || !week) {
      return
    }

    const fetchUserBets = async () => {
      try {
        const response = await fetch(
          `/api/bets?userId=${user.id}&seasonId=${week.seasonId}&weekNumber=${week.number}`,
        )
        if (!response.ok) {
          throw new Error('Falha ao buscar palpites existentes.')
        }
        const data = await response.json()
        if (data.bets && data.bets.length > 0) {
          const existingPalpites = data.bets.reduce(
            (acc: Record<string, string>, bet: { gameId: string; choiceId: string }) => {
              acc[bet.gameId] = bet.choiceId
              return acc
            },
            {},
          )
          setPalpites(existingPalpites)
          setHasSubmitted(true)
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Erro ao carregar seus palpites.'
        toast.error(message)
      }
    }

    fetchUserBets()
  }, [user, week])

  const handlePalpite = (jogoId: string, timeId: string) => {
    setPalpites(prev => ({
      ...prev,
      [jogoId]: timeId
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast.error('Você precisa estar logado para enviar suas apostas.')
      return
    }

    if (Object.keys(palpites).length < games.length) {
      toast.warning('Você precisa escolher um time para cada jogo.')
      return
    }

    setIsSubmitting(true)

    try {
      if (!week) {
        toast.error('Informações da semana não carregadas.')
        return
      }

      const betsPayload = games.map(game => ({
        gameId: game.id,
        choiceId: palpites[game.id],
      }))

      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          seasonId: week.seasonId,
          weekNumber: week.number,
          bets: betsPayload,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Falha ao enviar apostas.')
      }

      toast.success('Apostas enviadas com sucesso!')
      setHasSubmitted(true)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao enviar suas apostas.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <p>Carregando jogos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <p className="text-red-500">Erro ao carregar jogos: {error}</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-background text-text py-10 px-4">
      <div className="max-w-xl mx-auto bg-surface rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          🏈 Bolão Oval - {week?.name}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPalpite={handlePalpite}
              palpite={palpites[game.id]}
              disabled={hasSubmitted}
            />
          ))}

          {!hasSubmitted ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Apostas'}
            </button>
          ) : (
            <p className="text-center text-sm text-green-400 font-semibold">
              Suas apostas da rodada {week?.name} já foram enviadas!
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
