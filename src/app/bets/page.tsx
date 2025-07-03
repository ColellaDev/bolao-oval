'use client'

import { useState, useEffect } from 'react'

interface Team {
  id: string
  displayName: string
  abbreviation: string
  logo: string
}

interface Competitor {
  id: string
  team: Team
  homeAway: 'home' | 'away'
}

interface Competition {
  id: string
  competitors: Competitor[]
}

interface Game {
  id: string
  name: string
  shortName: string
  date: string
  competitions: Competition[]
}

export default function BetFormPage() {
  
  const [games, setGames] = useState<Game[]>([])
  const [week, setWeek] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

 
  const [userId, setUserId] = useState('')
  const [palpites, setPalpites] = useState<{ [key: string]: string }>({})
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  
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

    if (!userId) {
      alert('Informe o ID do usuário.')
      return
    }

    if (Object.keys(palpites).length < games.length) {
      alert('Você precisa escolher um time para cada jogo.')
      return
    }

    try {
      if (!week) {
        setStatus('error')
        console.error('Número da semana não carregado.')
        return
      }

      for (const game of games) {
        const choiceId = palpites[game.id]
        if (!choiceId) continue 

        await fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            week,
            gameId: game.id,
            choiceId
          })
        })
      }

      setStatus('success')
      setUserId('')
      setPalpites({})
    } catch (error) {
      console.error('Erro ao enviar apostas:', error)
      setStatus('error')
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
          <input
            className="w-full border border-zinc-600 bg-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="ID do Usuário"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          {games.map((game) => (
            <div key={game.id} className="bg-zinc-700 rounded-lg p-4">
              <p className="text-lg font-semibold mb-1 text-center">{game.name}</p>
              <p className="text-xs text-zinc-400 mb-3 text-center">
                {new Date(game.date).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short'
                })}
              </p>
              <div className="flex gap-4 justify-center">
                {game.competitions[0].competitors.map((competitor) => (
                  <button
                    key={competitor.team.id}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold border shadow-md transition-all
                      ${
                        palpites[game.id] === competitor.team.id
                          ? 'bg-blue-600 border-blue-700 text-white'
                          : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
                      }`}
                    onClick={() => handlePalpite(game.id, competitor.team.id)}
                  >
                    <img
                      src={competitor.team.logo}
                      alt={competitor.team.displayName}
                      className="w-6 h-6"
                    />
                    <span className="hidden sm:inline">
                      {competitor.team.displayName}
                    </span>
                    <span className="sm:hidden">{competitor.team.abbreviation}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg"
          >
            Enviar Apostas
          </button>

          {status === 'success' && (
            <p className="text-green-400 text-center font-semibold">✅ Apostas enviadas com sucesso!</p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-center font-semibold">❌ Erro ao enviar apostas.</p>
          )}
        </form>
      </div>
    </main>
  )
}
