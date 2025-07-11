import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const latestGameAndSeason = await prisma.game.findFirst({
      orderBy: [
        {
          seasonId: 'desc',
        },
        {
          weekNumber: 'desc',
        },
      ],
    })

    if (!latestGameAndSeason) {
      return NextResponse.json(
        {
          events: [],
          week: null,
          error: 'Nenhum jogo encontrado no banco de dados.',
        },
        { status: 404 },
      )
    }

    const { seasonId: currentSeasonId, weekNumber: currentWeekNumber } = latestGameAndSeason

    const weekInfo = await prisma.week.findUnique({
      where: {
        seasonId_number: {
          seasonId: currentSeasonId,
          number: currentWeekNumber,
        },
      },
    })

    const gamesFromDb = await prisma.game.findMany({
      where: {
        seasonId: currentSeasonId,
        weekNumber: currentWeekNumber,
      },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    const formattedGames = gamesFromDb.map((game) => ({
      id: game.id,
      name: game.name,
      date: game.date.toISOString(),
      competitions: [
        {
          competitors: [{ team: game.homeTeam }, { team: game.awayTeam }],
        },
      ],
    }))

    return NextResponse.json({
      events: formattedGames,
      week: weekInfo,
    })
  } catch (error) {
    console.error('Erro ao buscar jogos do banco de dados:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}

