import { GeneralRanking } from '@/components/HallOfFame/GeneralRanking'
import { PodiumPerSeason } from '@/components/HallOfFame/PodiumPerSeason'
import { StickerRanking } from '@/components/HallOfFame/StickerRanking'
import { TotalScore } from '@/components/HallOfFame/TotalScore'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 pt-10 text-white sm:p-8">
      <div className="w-full max-w-auto ">
        <h1 className="mb-12 text-center text-4xl font-bold text-yellow-400 md:text-5xl">
          🏆 Hall da Fama 🏆
        </h1>
        <h3 className="mb-12 text-center text-xl text-muted">Powered by Pedro Destro - WMS Creator and President</h3>
        <div className="grid grid-cols-1 items-start justify-items-center gap-16 lg:grid-cols-3">
          <TotalScore/>
          <GeneralRanking />
          <StickerRanking />
        </div>
          <PodiumPerSeason />
      </div>
    </main>
  )
}
