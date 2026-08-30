'use client'

import { useState } from 'react'
import { toast } from 'sonner'

import { Game, WeekInfo } from '@/types'

export function useSubmitBets({
  userId,
  week,
  games,
  palpites,
  onSuccess,
}: {
  userId?: string
  week: WeekInfo | null
  games: Game[]
  palpites: Record<string, string>
  onSuccess?: () => void
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async (event?: React.FormEvent) => {
    event?.preventDefault()

    if (!userId) {
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

      const betsPayload = games.map((game) => ({
        gameId: game.id,
        choiceId: palpites[game.id],
      }))

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          seasonId: week.seasonId,
          weekNumber: week.number,
          bets: betsPayload,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Falha ao enviar apostas.')
      }

      toast.success('Apostas enviadas com sucesso!')
      onSuccess?.()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocorreu um erro ao enviar suas apostas.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submit,
    isSubmitting,
  }
}
