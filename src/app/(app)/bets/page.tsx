'use client'

import { GameCard } from '@/components/GameCard'
import { useAuth } from '@/hooks/useAuth'
import { useSubmitBets } from '@/hooks/bets/useSubmitBets'
import { useUserBets } from '@/hooks/bets/useUserBets'
import { useWeekGames } from '@/hooks/bets/useWeekGames'

export default function BetFormPage() {
  const { user } = useAuth()
  const { games, week, loading, error } = useWeekGames()
  const { palpites, setPalpites, hasSubmitted, setHasSubmitted } = useUserBets(user?.id, week)
  const { submit, isSubmitting } = useSubmitBets({userId: user?.id, week, games, palpites, onSuccess: () => setHasSubmitted(true)})

  const handlePalpite = (jogoId: string, timeId: string) => {
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: timeId,
    }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    await submit(event)
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
