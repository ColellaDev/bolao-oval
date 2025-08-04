import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const calculateScoreSchema = z.object({
  seasonId: z.number(),
  weekNumber: z.number(),
})

const POINTS_PER_CORRECT_BET = 1

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { seasonId, weekNumber } = calculateScoreSchema.parse(body)

    const finishedGames = await prisma.game.findMany({
      where: {
        seasonId,
        weekNumber,
        status: 'FINAL',
        winnerTeamId: { not: null },
      },
      select: {
        id: true,
        winnerTeamId: true,
      },
    })

    if (finishedGames.length === 0) {
      return NextResponse.json(
        {
          message:
            'Nenhum jogo finalizado encontrado para esta semana. Nenhuma pontuação foi calculada.',
        },
        { status: 200 },
      )
    }

    const winnersMap = new Map<string, string | null>(
      finishedGames.map((game) => [game.id, game.winnerTeamId]),
    )
    const gameIds = Array.from(winnersMap.keys())

    const betsToScore = await prisma.bet.findMany({
      where: {
        gameId: { in: gameIds },
        points: 0, 
      },
    })

    const correctBets = betsToScore.filter(
      (bet) => winnersMap.get(bet.gameId) === bet.choiceId,
    )

    if (correctBets.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum acerto novo para pontuar nesta semana.' },
        { status: 200 },
      )
    }

    const userPoints = correctBets.reduce((acc, bet) => {
      acc.set(bet.userId, (acc.get(bet.userId) || 0) + 1)
      return acc
    }, new Map<string, number>())

    const participantsInSeason = await prisma.bet.groupBy({
      by: ['userId'],
      where: {
        seasonId,
      },
    })
    const totalParticipants = participantsInSeason.length

    const weeklyRanking = Array.from(userPoints.entries())
      .map(([userId, weeklyScore]) => ({ userId, weeklyScore }))
      .sort((a, b) => b.weeklyScore - a.weeklyScore) 

    const userSlPoints = new Map<string, number>()
    let rank = 1
    for (let i = 0; i < weeklyRanking.length; i++) {
      if (i > 0 && weeklyRanking[i].weeklyScore < weeklyRanking[i - 1].weeklyScore) {
        rank = i + 1
      }

      const { userId } = weeklyRanking[i]
      const slPointsToAdd = totalParticipants > 0 ? totalParticipants - rank + 1 : 0
      userSlPoints.set(userId, slPointsToAdd)
    }

    const correctBetIds = correctBets.map((bet) => bet.id)

    const updateBetsPromise = prisma.bet.updateMany({
      where: { id: { in: correctBetIds } },
      data: { points: POINTS_PER_CORRECT_BET },
    })

    const updateUserScoresPromises = Array.from(userPoints.entries()).map(([userId, pointsToAdd]) => {
      const slPointsToAdd = userSlPoints.get(userId) || 0
      return prisma.userSeasonScore.upsert({
        where: { userId_seasonId: { userId, seasonId } },
        update: { score: { increment: pointsToAdd }, sl: { increment: slPointsToAdd } },
        create: { userId, seasonId, score: pointsToAdd, sl: slPointsToAdd },
      })
    })

    await prisma.$transaction([updateBetsPromise, ...updateUserScoresPromises])

    return NextResponse.json({
      message: 'Pontuação e SL Score calculados com sucesso!',
      updatedBets: correctBets.length,
      usersScored: userPoints.size,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Erro ao calcular pontuação:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
