import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const calculateScoreSchema = z.object({
  seasonId: z.number(),
  weekNumber: z.number(),
})

type ScoreMap = Map<string, number>

function calculateSlFromScores(
  scores: ScoreMap,
  totalSeasonParticipants: number,
): ScoreMap {
  const rankedUsers = Array.from(scores.entries())
    .map(([userId, weeklyScore]) => ({ userId, weeklyScore }))
    .sort((a, b) => b.weeklyScore - a.weeklyScore)

  const slScores = new Map<string, number>()
  let rank = 1
  for (let i = 0; i < rankedUsers.length; i++) {
    if (i > 0 && rankedUsers[i].weeklyScore < rankedUsers[i - 1].weeklyScore) {
      rank = i + 1
    }
    const slPoints =
      totalSeasonParticipants > 0 ? totalSeasonParticipants - rank + 1 : 0
    slScores.set(rankedUsers[i].userId, slPoints)
  }
  return slScores
}

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
        { message: 'Nenhum jogo finalizado encontrado para esta semana.' },
        { status: 200 },
      )
    }

    const winnersMap = new Map<string, string | null>(
      finishedGames.map((game) => [game.id, game.winnerTeamId]),
    )

    const gameIds = Array.from(winnersMap.keys())

    const allWeekBets = await prisma.bet.findMany({
      where: {
        gameId: { in: gameIds },
       },
    })

    const allUserIdsInWeek = [...new Set(allWeekBets.map((b) => b.userId))]

    const participantsInSeason = await prisma.bet.groupBy({
      by: ['userId'],
      where: { seasonId },
    })

    const totalSeasonParticipants = participantsInSeason.length

    const weeklyScores: ScoreMap = new Map()
    for (const bet of allWeekBets) {
      if (winnersMap.get(bet.gameId) === bet.choiceId) {
        weeklyScores.set(
          bet.userId,
          (weeklyScores.get(bet.userId) || 0) + POINTS_PER_CORRECT_BET,
        )
      }
    }

    const weeklySl = calculateSlFromScores(weeklyScores, totalSeasonParticipants)

    const betsToUpdatePoints = allWeekBets.filter(
      (bet) => bet.points === 0 && winnersMap.get(bet.gameId) === bet.choiceId,
    )
    const correctBetIdsToUpdate = betsToUpdatePoints.map((b) => b.id)

    const updateBetsPromise = prisma.bet.updateMany({
      where: { id: { in: correctBetIdsToUpdate } },
      data: { points: POINTS_PER_CORRECT_BET },
    })

    const updateUserWeekScorePromises = allUserIdsInWeek.map((userId) => {
      const score = weeklyScores.get(userId) || 0
      const sl = weeklySl.get(userId) || 0

      return prisma.userWeekScore.upsert({
        where: { userId_seasonId_weekNumber: { userId, seasonId, weekNumber } },
        update: { score, sl },
        create: { userId, seasonId, weekNumber, score, sl },
      })
    })

    await prisma.$transaction([updateBetsPromise, ...updateUserWeekScorePromises])

    return NextResponse.json({
      message: `Scores da semana ${weekNumber} calculados e salvos com sucesso!`,
      updatedBets: betsToUpdatePoints.length,
      usersScoredInWeek: allUserIdsInWeek.length,
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
