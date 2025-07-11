import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const calculateScoreSchema = z.object({
  seasonId: z.number(),
  weekNumber: z.number(),
})

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

    const correctBetIds = correctBets.map((bet) => bet.id)

    const updateBetsPromise = prisma.bet.updateMany({
      where: { id: { in: correctBetIds } },
      data: { points: 1 },
    })

    const updateUserScoresPromises = Array.from(userPoints.entries()).map(
      ([userId, pointsToAdd]) =>
        prisma.userSeasonScore.upsert({
          where: { userId_seasonId: { userId, seasonId } },
          update: { score: { increment: pointsToAdd } },
          create: { userId, seasonId, score: pointsToAdd },
        }),
    )

    await prisma.$transaction([updateBetsPromise, ...updateUserScoresPromises])

    return NextResponse.json({
      message: 'Pontuação calculada com sucesso!',
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
