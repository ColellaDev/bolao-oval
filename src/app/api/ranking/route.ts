import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request) {
  try {
    const latestSeason = await prisma.season.findFirst({
      orderBy: {
        id: 'desc',
      },
    })

    if (!latestSeason) {
      return NextResponse.json(
        { error: 'Nenhuma temporada encontrada.' },
        { status: 404 },
      )
    }

    const seasonIdToQuery = latestSeason.id

    const aggregatedScores = await prisma.userWeekScore.groupBy({
      by: ['userId'],
      where: {
        seasonId: seasonIdToQuery,
      },
      _sum: {
        score: true,
        sl: true,
      },
    })

    const userIds = aggregatedScores.map((s) => s.userId)
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true },
    })

    const userMap = new Map(users.map((u) => [u.id, u]))

    const combinedScores = aggregatedScores
      .map((agg) => ({
        user: userMap.get(agg.userId),
        score: agg._sum.score || 0,
        sl: agg._sum.sl || 0,
      }))
      .filter((item) => item.user)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.sl - a.sl
      })

    let rank = 1
    const rankedScores = combinedScores.map((score, index, allScores) => {
      if (
        index > 0 &&
        (score.score !== allScores[index - 1].score || score.sl !== allScores[index - 1].sl)
      ) {
        rank = index + 1
      }
      return { ...score, rank }
    })

    return NextResponse.json({ ranking: rankedScores, totalUsers: rankedScores.length })
  } catch (error) {
    console.error('Erro ao buscar o ranking:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
