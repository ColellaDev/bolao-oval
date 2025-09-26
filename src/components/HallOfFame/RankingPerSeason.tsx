import { hallOfFameData } from "@/data/hall-of-fame"
import { Sticker, Trophy } from 'lucide-react'

export function RankingPerSeason() {
  const trophyColors: { [key: number]: string } = {
    1: 'text-yellow-400',
    2: 'text-zinc-400',
    3: 'text-yellow-600',
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-10 mt-16 text-center text-4xl font-bold text-text">
          Ranking por Temporada
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 ">
          {hallOfFameData.slice().reverse().map((bolao) => {
            return (
              <div
                key={bolao.season}
                className="flex flex-col rounded-xl border-2 border-surface bg-surface p-4 shadow-xl"
              >
                <h3 className="mb-4 text-center text-xl font-semibold text-white">
                  {bolao.season}
                </h3>
                <table className="w-full text-left text-sm sm:text-base">
                  <thead className="border-b-2 border-muted/20">
                    <tr>
                      <th className="w-14 p-2 font-semibold">Pos.</th>
                      <th className="p-2 font-semibold">Nome</th>
                      <th className="p-2 text-right font-semibold">Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bolao.winners.map((winner) => (
                      <tr key={winner.place} className="border-b border-muted/10 last:border-b-0">
                        <td className="p-2 text-center font-bold">
                          <span className={`${[1, 2, 3].includes(winner.place) ? trophyColors[winner.place] : ''}`}>
                            {`${winner.place}º`}
                          </span>
                        </td>
                        <td className="flex items-center gap-2 p-2">
                          {winner.adesivo && ( <Sticker className="h-5 w-5 text-blue-300" />)}
                          {[1, 2, 3].includes(winner.place) && (<Trophy className={`h-5 w-5 ${trophyColors[winner.place]}`}/>)}
                           <span className={`${[1, 2, 3].includes(winner.place) ? trophyColors[winner.place] : ''}`}>
                            {winner.name}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono">
                          <span className={`${[1, 2, 3].includes(winner.place) ? trophyColors[winner.place] : ''}`}>
                            {winner.score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
    </div>
    )
}