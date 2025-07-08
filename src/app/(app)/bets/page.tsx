'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Game } from '@/types'
import { GameCard } from '@/components/GameCard'
import { useAuth } from '@/hooks/useAuth'

export default function BetFormPage() {
  const [games, setGames] = useState<Game[]>([])
  const [week, setWeek] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [palpites, setPalpites] = useState<{ [key: string]: string }>({}) 
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(
          'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard'
        )
        if (!response.ok) {
          throw new Error('Falha ao buscar os jogos da API')
        }
        const data = await response.json()
        setGames(data.events)
        setWeek(data.week.number)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [])

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
        toast.error('Número da semana não carregado. Tente novamente.')
        return
      }

      for (const game of games) {
        const choiceId = palpites[game.id]
        if (!choiceId) continue 

        await fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            week,
            gameId: game.id,
            choiceId
          })
        })
      }

      toast.success('Apostas enviadas com sucesso!')
      setPalpites({})
    } catch (error) {
      toast.error('Ocorreu um erro ao enviar suas apostas.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <p>Carregando jogos...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900 text-white">
        <p className="text-red-500">Erro ao carregar jogos: {error}</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white py-10 px-4">
      <div className="max-w-xl mx-auto bg-zinc-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Bolão Oval - Semana {week} 🏈
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPalpite={handlePalpite}
              palpite={palpites[game.id]}
            />
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Apostas'}
          </button>
        </form>
      </div>
    </main>
  )
}
