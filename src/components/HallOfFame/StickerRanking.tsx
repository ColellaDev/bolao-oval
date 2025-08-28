import { hallOfFameData } from '@/data/hall-of-fame'
import { Sticker } from 'lucide-react'

export function StickerRanking() {
  const stickerCounts = hallOfFameData.reduce(
    (acc, bolao) => {
      bolao.winners.forEach((winner) => {
        if (winner.place === 'adesivo') {
          if (!acc[winner.name]) {
            acc[winner.name] = 0
          }
          acc[winner.name]++
        }
      })
      return acc
    },
    {} as Record<string, number>,
  )

  const rankedWinners = Object.entries(stickerCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  let lastRank = 0
  let lastCount = -1

  const winnersWithRank = rankedWinners.map((winner, index) => {
    const isTie = lastCount !== -1 && winner.count === lastCount

    if (!isTie) {
      lastRank = index + 1
      lastCount = winner.count
    }

    return { ...winner, rank: lastRank }
  })

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-zinc-400'
    if (rank === 3) return 'text-yellow-600'
    return 'text-primary'
  }

  const renderStickers = (count: number) => {
    if (!count) return null
    return Array.from({ length: count }).map((_, i) => (
      <Sticker key={i} className="h-5 w-5 text-blue-300" />
    ))
  }

  return (
    <div className="mb-16 max-w-xl rounded-xl border-2 border-surface bg-surface/30 p-6 shadow-lg">
      <h2 className="mb-6 text-center text-3xl font-bold text-text">
        Ranking de Adesivos
      </h2>
      <ol className="space-y-4">
        {winnersWithRank.map((winner) => (
          <li
            key={winner.name}
            className="flex flex-col items-start gap-2 rounded-lg bg-surface p-4 shadow-md sm:flex-row sm:items-center sm:justify-between transition-colors hover:bg-muted/10"
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
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-14 sm:pl-0">
              {renderStickers(winner.count)}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}