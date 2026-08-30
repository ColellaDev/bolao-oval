'use client'

import { Calendar, Calculator, Loader2 } from 'lucide-react'
import { useAdminActions } from '@/hooks/admin/useAdminActions'

export default function IngestGamesPage() {
  const {
    ingestForm,
    scoreForm,
    handleIngestGames,
    handleCalculateScores,
  } = useAdminActions()

  const {
    register: registerIngest,
    handleSubmit: handleIngestSubmit,
    formState: { errors: ingestErrors, isSubmitting: isIngestSubmitting },
  } = ingestForm

  const {
    register: registerScore,
    handleSubmit: handleScoreSubmit,
    formState: { errors: scoreErrors, isSubmitting: isScoreSubmitting },
  } = scoreForm

  return (
    <main className="min-h-screen bg-background text-text py-10 px-4">
      <div className="max-w-xl mx-auto space-y-10">
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

          <form onSubmit={handleIngestSubmit(handleIngestGames)} className="space-y-6">
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
                  {...registerIngest('week')}
                  className="w-full bg-surface text-text border border-muted pl-10 pr-4 py-3 rounded-lg placeholder-muted focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                />
              </div>
              {ingestErrors.week && (
                <p className="text-red-400 text-left text-sm">
                  {ingestErrors.week.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isIngestSubmitting}
              className="w-full bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isIngestSubmitting ? (
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

        <div className="bg-surface rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-center flex items-center justify-center gap-2">
            <Calculator className="w-6 h-6" />
            Cálculo de Pontos da Semana
          </h2>

          <p className="text-center text-muted mb-6 text-sm">
            Calcula os pontos dos palpites para uma determinada semana e
            temporada, atualizando a pontuação dos usuários.
          </p>

          <form onSubmit={handleScoreSubmit(handleCalculateScores)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="seasonId" className="text-left block font-medium">
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
                <label htmlFor="weekNumber" className="text-left block font-medium">
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
              disabled={isScoreSubmitting}
              className="w-full bg-primary hover:bg-primary-hover transition-colors text-white py-3 rounded-lg font-bold shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScoreSubmitting ? (
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
