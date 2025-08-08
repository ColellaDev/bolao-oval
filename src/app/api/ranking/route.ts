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

    const scores = await prisma.userSeasonScore.findMany({
      where: {
        seasonId: seasonIdToQuery,
      },
      orderBy: [{ score: 'desc' }, { sl: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    const validScores = scores.filter((item) => item.user)

    let rank = 1

    const rankedScores = validScores.map((score, index, allScores) => {
      if (
        index > 0 &&
        (score.score !== allScores[index - 1].score ||
          score.sl !== allScores[index - 1].sl)
      ) {
        rank = index + 1
      }
      return { ...score, rank }
    })

    return NextResponse.json({
      ranking: rankedScores,
      totalUsers: rankedScores.length,
    })
  } catch (error) {
    console.error('Erro ao buscar o ranking:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
