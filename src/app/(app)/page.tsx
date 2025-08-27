import { GeneralRanking } from '@/components/GeneralRanking'
import { PodiumPerSeason } from '@/components/PodiumPerSeason'
import { StickerRanking } from '@/components/StickerRanking'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background p-4 pt-10 text-white sm:p-8">
      <div className="w-full max-w-6xl">
        <h1 className="mb-12 text-center text-4xl font-bold text-yellow-400 md:text-5xl">
          🏆 Hall da Fama 🏆
        </h1>
        <div className="flex flex-wrap items-start justify-center gap-16">
          <GeneralRanking />
          <StickerRanking />
        </div>
        <PodiumPerSeason />
      </div>
    </main>
  )
}
