import { hallOfFameData } from "@/data/hall-of-fame"
import { Trophy } from 'lucide-react'

export function GeneralRanking() {
  const podiumCounts = hallOfFameData.reduce(
    (acc, bolao) => {
      bolao.winners.forEach((winner) => {
        if (winner.place === 1 || winner.place === 2 || winner.place === 3) {
          if (!acc[winner.name]) {
            acc[winner.name] = { 1: 0, 2: 0, 3: 0 }
          }
          acc[winner.name][winner.place as 1 | 2 | 3]++
        }
      })
      return acc
    },
    {} as Record<string, { 1: number; 2: number; 3: number }>,
  )

  const rankedWinners = Object.entries(podiumCounts)
    .map(([name, podiums]) => ({ name, podiums }))
    .sort(
      (a, b) =>
        b.podiums[1] - a.podiums[1] ||
        b.podiums[2] - a.podiums[2] ||
        b.podiums[3] - a.podiums[3],
    )

  let lastRank = 0
  let lastPodiums: { 1: number; 2: number; 3: number } | null = null

  const winnersWithRank = rankedWinners.map((winner, index) => {
    const isTie =
      lastPodiums !== null &&
      winner.podiums[1] === lastPodiums[1] &&
      winner.podiums[2] === lastPodiums[2] &&
      winner.podiums[3] === lastPodiums[3]

    if (!isTie) {
      lastRank = index + 1
      lastPodiums = winner.podiums
    }

    return { ...winner, rank: lastRank }
  })

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-zinc-400'
    if (rank === 3) return 'text-yellow-600'
    return 'text-text'
  }

  const trophyColors: { [key: number]: string } = {
    1: 'text-yellow-400',
    2: 'text-zinc-400',
    3: 'text-yellow-600',
  }

  const renderTrophies = (count: number, place: 1 | 2 | 3) => {
    if (!count) return null
    return Array.from({ length: count }).map((_, i) => (
      <Trophy key={`${place}-${i}`} className={`h-5 w-5 ${trophyColors[place]}`} />
    ))
  }

  return (
    <div className="mb-16 max-w-xl rounded-xl border-2 border-surface bg-surface/30 p-6 shadow-lg">
      <h2 className="mb-6 text-center text-3xl font-bold text-text">
        Ranking de Títulos
      </h2>
      <ol className="space-y-4">
        {winnersWithRank.map((winner) => (
          <li
            key={winner.name}
            className="flex flex-col items-start gap-2 rounded-lg bg-surface p-4 shadow-md sm:flex-row sm:items-center sm:justify-between sm:gap-10 transition-colors hover:bg-muted/10"
          >
            <div className="flex items-center gap-4">
              <span
                className={`w-10 text-center text-2xl font-bold ${getRankColor(
                  winner.rank,
                )}`}
              >
                {winner.rank}º
              </span>
              <p className="text-xl font-medium">{winner.name}</p>
            </div>
            <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 sm:pl-0">
              {renderTrophies(winner.podiums[1], 1)}
              {renderTrophies(winner.podiums[2], 2)}
              {renderTrophies(winner.podiums[3], 3)}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}