'use client'

import { useEffect, useState } from 'react'
import { Medal } from 'lucide-react'
import { toast } from 'sonner'

type RankedUser = {
  id: string
  userId: string
  seasonId: number
  score: number
  sl: number
  user: {
    id: string
    name: string
  }
  rank: number
}

type RankingData = {
  ranking: RankedUser[]
  totalUsers: number
}

const getPodiumClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'text-yellow-400' // Ouro
    case 2:
      return 'text-gray-300' // Prata
    case 3:
      return 'text-yellow-600' // Bronze
    default:
      return 'text-muted'
  }
}

export default function RankingPage() {
  const [rankingData, setRankingData] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/ranking`)

        if (!response.ok) {
          const data = await response.json().catch(() => ({}))
          throw new Error(
            data.error || 'Falha ao buscar o ranking do nosso servidor',
          )
        }

        const data: RankingData = await response.json()
        setRankingData(data)
      } catch (err: any) {
        const errorMessage =
          err.message || 'Ocorreu um erro desconhecido ao carregar o ranking.'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchRanking()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <p>Carregando ranking...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text">
        <p className="text-red-500">Erro: {error}</p>
      </div>
    )
  }

  return (
    <main className="bg-background text-text min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-surface backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-yellow-400 mb-2 text-center">
            Ranking da Temporada
          </h1>
          <p className="text-center text-muted mb-8">
            Total de {rankingData?.totalUsers || 0} participantes
          </p>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead className="bg-background">
                <tr>
                  <th className="p-3 text-sm font-bold uppercase text-white border-b border-muted w-24 text-center">
                    Posição
                  </th>
                  <th className="p-3 text-sm font-bold uppercase text-white border-b border-muted">
                    Participante
                  </th>
                  <th className="p-3 text-sm font-bold uppercase text-white border-b border-muted text-right">
                    Pontos
                  </th>
                  <th className="p-3 text-sm font-bold uppercase text-white border-b border-muted text-right">
                    SL
                  </th>
                </tr>
              </thead>
              <tbody>
                {rankingData?.ranking.map((item) => (
                  <tr
                    key={item.user.id}
                    className="hover:bg-white/5 transition-colors duration-200 border-b border-muted last:border-b-0"
                  >
                    <td className="p-3 text-center">
                      <span
                        className={`text-lg font-bold flex items-center justify-center gap-2 ${getPodiumClass(
                          item.rank,
                        )}`}
                      >
                        {item.rank <= 3 && <Medal size={20} />}
                        {item.rank}º
                      </span>
                    </td>
                    <td className="p-3 font-medium">{item.user.name}</td>
                    <td className="p-3 text-right font-semibold text-lg">
                      {item.score}
                    </td>
                    <td className="p-3 text-right text-muted">
                      {item.sl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rankingData?.ranking.length === 0 && (
            <div className="text-center py-10 text-muted">
              <p>Nenhum participante no ranking desta temporada ainda.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
