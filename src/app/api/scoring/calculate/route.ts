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

    const correctBetIds: string[] = []
    const userPoints = new Map<string, number>() 

    for (const bet of betsToScore) {
      const winnerId = winnersMap.get(bet.gameId)
      if (winnerId && bet.choiceId === winnerId) {
        correctBetIds.push(bet.id)
        userPoints.set(bet.userId, (userPoints.get(bet.userId) || 0) + 1)
      }
    }

    if (correctBetIds.length === 0) {
      return NextResponse.json(
        { message: 'Nenhum acerto novo para pontuar nesta semana.' },
        { status: 200 },
      )
    }

    const transactionPromises = []

    transactionPromises.push(
      prisma.bet.updateMany({
        where: { id: { in: correctBetIds } },
        data: { points: 1 },
      }),
    )

    for (const [userId, pointsToAdd] of userPoints.entries()) {
      transactionPromises.push(
        prisma.userSeasonScore.upsert({
          where: { userId_seasonId: { userId, seasonId } },
          update: { score: { increment: pointsToAdd } },
          create: { userId, seasonId, score: pointsToAdd },
        }),
      )
    }

    await prisma.$transaction(transactionPromises)

    return NextResponse.json({
      message: 'Pontuação calculada com sucesso!',
      updatedBets: correctBetIds.length,
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
