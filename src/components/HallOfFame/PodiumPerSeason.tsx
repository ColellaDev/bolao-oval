import { hallOfFameData } from "@/data/hall-of-fame"
import { Sticker} from 'lucide-react'

export function PodiumPerSeason() {

    return (
    <div className="mx-auto w-full max-w-7xl">
        <h2 className="mb-10 mt-16 text-center text-4xl font-bold text-text">
          Pódios por Temporada
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3 ">
          {hallOfFameData.slice().reverse().map((bolao) => {
            const [p1, p2, p3, pAdesivo] = bolao.winners
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
                    <tr className="border-b border-muted/10">
                      <td className="p-2 text-center font-bold text-yellow-400">
                        1º
                      </td>
                      <td className="p-2">{p1.name}</td>
                      <td className="p-2 text-right font-mono">{p1.score}</td>
                    </tr>
                    <tr className="border-b border-muted/10">
                      <td className="p-2 text-center font-bold text-zinc-400">
                        2º
                      </td>
                      <td className="p-2">{p2.name}</td>
                      <td className="p-2 text-right font-mono">{p2.score}</td>
                    </tr>
                    <tr className="border-b border-muted/10">
                      <td className="p-2 text-center font-bold text-yellow-600">
                        3º
                      </td>
                      <td className="p-2">{p3.name}</td>
                      <td className="p-2 text-right font-mono">{p3.score}</td>
                    </tr>
                    <tr>
                      <td className="p-2 text-center font-bold text-blue-300">
                        <Sticker
                          className="mx-auto h-5 w-5"
                        />
                      </td>
                      <td className="p-2">{pAdesivo.name}</td>
                      <td className="p-2 text-right font-mono">
                        {pAdesivo.score}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )
          })}
        </div>
    </div>
    )
}