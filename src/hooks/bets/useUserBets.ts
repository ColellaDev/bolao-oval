'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { WeekInfo } from '@/types'

export type BetMap = Record<string, string>

export function useUserBets(userId?: string, week?: WeekInfo | null) {
  const [palpites, setPalpites] = useState<BetMap>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)

  useEffect(() => {
    if (!userId || !week) {
      return
    }

    const fetchUserBets = async () => {
      try {
        const response = await fetch(
          `/api/bets?userId=${userId}&seasonId=${week.seasonId}&weekNumber=${week.number}`,
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
          err instanceof Error ? err.message : 'Erro ao carregar seus palpites.'
        toast.error(message)
      }
    }

    fetchUserBets()
  }, [userId, week])

  return {
    palpites,
    setPalpites,
    hasSubmitted,
    setHasSubmitted,
  }
}
