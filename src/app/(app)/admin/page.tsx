'use client'

import { useForm } from 'react-hook-form'
import { ZodError, z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Calendar, Calculator, Loader2 } from 'lucide-react'

const ingestGamesSchema = z.object({
  week: z.coerce
    .number({ invalid_type_error: 'A semana deve ser um número.' })
    .min(1, 'A semana deve ser maior que 0.')
    .optional(),
})

type IngestGamesData = z.infer<typeof ingestGamesSchema>

const calculateScoreSchema = z.object({
  seasonId: z.coerce
    .number({ invalid_type_error: 'A temporada deve ser um número.' })
    .min(2000, 'A temporada deve ser um ano válido.'),
  weekNumber: z.coerce
    .number({ invalid_type_error: 'A semana deve ser um número.' })
    .min(1, 'A semana deve ser maior que 0.'),
})

type CalculateScoreData = z.infer<typeof calculateScoreSchema>

export default function IngestGamesPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset: resetIngestForm,
  } = useForm<IngestGamesData>({
    resolver: zodResolver(ingestGamesSchema),
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

      toast.success(
        resData.message || 'Jogos atualizados com sucesso!',
      )

      resetIngestForm()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.'
      toast.error(message)
    }
  }

  const {
    register: registerScore,
    handleSubmit: handleSubmitScore,
    formState: { errors: scoreErrors, isSubmitting: isSubmittingScore },
    reset: resetScoreForm,
  } = useForm<CalculateScoreData>({
    resolver: zodResolver(calculateScoreSchema),
  })

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

      toast.success(
        resData.message || 'Pontuações calculadas com sucesso!',
        {
          description: `Palpites atualizados: ${resData.updatedBets}. Usuários pontuados: ${resData.usersScoredInWeek}.`,
        },
      )

      resetScoreForm()
    } catch (err) {
      let message = 'Ocorreu um erro desconhecido.'
      if (err instanceof Error) {
        message = err.message
      } else if (err instanceof ZodError) {
        message =
          'Erro de validação: ' +
          err.errors.map((e) => e.message).join(', ')
      }
      toast.error(message)
    }
  }

  return (
    <main className="min-h-screen bg-background text-text py-10 px-4">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Seção de Ingestão de Jogos */}
        <div className="bg-surface rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <Calendar className="w-6 h-6" />
            Ingestão de Jogos da Semana
          </h2>

          <p className="text-center text-muted mb-6 text-sm">
            Busca os jogos da semana na API da ESPN e os salva ou atualiza no
            banco de dados. Se a semana não for informada, busca a semana atual
            da temporada.
          </p>

        <form
          onSubmit={handleSubmit(handleIngestGames)}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label htmlFor="week" className="text-left block font-medium">
              Semana (opcional)
            </label>
            <div className="relative flex items-center">
              <Calendar className="w-5 h-5 absolute left-3 text-muted" />
              <input
                id="week"
                type="number"
                placeholder="Deixe em branco para a semana atual"
                {...register('week')}
                className="w-full bg-surface text-text border border-muted pl-10 pr-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
              />
            </div>
            {errors.week && (
              <p className="text-red-400 text-left text-sm">
                {errors.week.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Buscando...
              </>
            ) : (
              'Buscar Jogos da Semana'
            )}
          </button>
        </form>
        </div>

        {/* Seção de Cálculo de Pontos */}
        <div className="bg-surface rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <Calculator className="w-6 h-6" />
            Cálculo de Pontos da Semana
          </h2>

          <p className="text-center text-muted mb-6 text-sm">
            Calcula os pontos dos palpites para uma determinada semana e
            temporada, atualizando a pontuação dos usuários.
          </p>

          <form
            onSubmit={handleSubmitScore(handleCalculateScores)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="seasonId"
                  className="text-left block font-medium"
                >
                  Temporada (Ano)
                </label>
                <input
                  id="seasonId"
                  type="number"
                  placeholder="Ex: 2024"
                  {...registerScore('seasonId')}
                  className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
                {scoreErrors.seasonId && (
                  <p className="text-red-400 text-left text-sm">
                    {scoreErrors.seasonId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label
                  htmlFor="weekNumber"
                  className="text-left block font-medium"
                >
                  Semana
                </label>
                <input
                  id="weekNumber"
                  type="number"
                  placeholder="Ex: 8"
                  {...registerScore('weekNumber')}
                  className="w-full bg-surface text-text border border-muted px-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
                {scoreErrors.weekNumber && (
                  <p className="text-red-400 text-left text-sm">
                    {scoreErrors.weekNumber.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmittingScore}
              className="w-full  bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingScore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Calculando...
                </>
              ) : (
                'Calcular Pontos'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
