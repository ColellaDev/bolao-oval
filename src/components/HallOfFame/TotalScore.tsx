import { hallOfFameData } from '@/data/hall-of-fame'

export function TotalScore() {
  const totalScores = hallOfFameData.reduce(
    (acc, temporada) => {
      temporada.winners.forEach((winner) => {
        if (!acc[winner.name]) {
          acc[winner.name] = 0
        }
        acc[winner.name] += winner.score
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const rankedPlayers = Object.entries(totalScores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score)

  let lastRank = 0
  let lastScore: number | null = null

  const playersWithRank = rankedPlayers.map((player, index) => {
    const isTie = lastScore !== null && player.score === lastScore

    if (!isTie) {
      lastRank = index + 1
      lastScore = player.score
    }

    return { ...player, rank: lastRank }
  })

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'text-yellow-400'
      case 2:
        return 'text-zinc-400'
      case 3:
        return 'text-yellow-600'
      default:
        return 'text-text'
    }
  }

  return (
    <div className="mb-16 w-full max-w-115 rounded-xl border-2 border-surface bg-surface/30 p-6 shadow-lg">
      <h2 className="mb-10 text-center text-3xl font-bold text-text">
        Ranking de Pontuação
      </h2>

      <ol className="w-full space-y-2 rounded-xl border-2 border-surface bg-surface p-2 text-lg shadow-xl">
        {playersWithRank.map((player) => (
          <li
            key={player.name}
            className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-muted/10"
          >
            <div className="flex min-w-0 items-center gap-4">
              <span
                className={`w-8 text-center text-xl font-bold ${getRankColor(
                  player.rank,
                )}`}
              >
                {player.rank}º
              </span>
              <span className="truncate font-medium text-white">
                {player.name}
              </span>
            </div>
            <span className="flex-shrink-0 font-mono font-semibold text-primary">
              {player.score.toLocaleString('pt-BR')} pts
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}