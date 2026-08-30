'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const ingestGamesSchema = z.object({
  week: z.coerce
    .number({ invalid_type_error: 'A semana deve ser um número.' })
    .min(1, 'A semana deve ser maior que 0.')
    .optional(),
})

const calculateScoreSchema = z.object({
  seasonId: z.coerce
    .number({ invalid_type_error: 'A temporada deve ser um número.' })
    .min(2000, 'A temporada deve ser um ano válido.'),
  weekNumber: z.coerce
    .number({ invalid_type_error: 'A semana deve ser um número.' })
    .min(1, 'A semana deve ser maior que 0.'),
})

export type IngestGamesData = z.infer<typeof ingestGamesSchema>
export type CalculateScoreData = z.infer<typeof calculateScoreSchema>

export function useAdminActions() {
  const ingestForm = useForm<IngestGamesData>({
    resolver: zodResolver(ingestGamesSchema),
  })

  const scoreForm = useForm<CalculateScoreData>({
    resolver: zodResolver(calculateScoreSchema),
  })

  const handleIngestGames = async (data: IngestGamesData) => {
    try {
      const payload = data.week ? { week: data.week } : {}

      const res = await fetch('/api/ingest-games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const resData = await res.json()

      if (!res.ok) {
        throw new Error(resData.error || 'Falha ao buscar os jogos.')
      }

      toast.success(resData.message || 'Jogos atualizados com sucesso!')
      ingestForm.reset()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.'
      toast.error(message)
    }
  }

  const handleCalculateScores = async (data: CalculateScoreData) => {
    try {
      const res = await fetch('/api/scoring/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const resData = await res.json()

      if (!res.ok) {
        throw new Error(resData.error || 'Falha ao calcular as pontuações.')
      }

      toast.success(resData.message || 'Pontuações calculadas com sucesso!', {
        description: `Palpites atualizados: ${resData.updatedBets}. Usuários pontuados: ${resData.usersScoredInWeek}.`,
      })

      scoreForm.reset()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.'
      toast.error(message)
    }
  }

  return {
    ingestForm,
    scoreForm,
    handleIngestGames,
    handleCalculateScores,
  }
}
