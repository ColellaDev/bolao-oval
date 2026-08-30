import { prisma } from '@/lib/prisma'

export async function getCurrentGamesPayload() {
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
    return {
      events: [],
      week: null,
      error: 'Nenhum jogo encontrado no banco de dados.',
    }
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
    homeTeamScore: game.homeTeamScore,
    awayTeamScore: game.awayTeamScore,
    winnerTeamId: game.winnerTeamId,
    status: game.status,
  }))

  return {
    events: formattedGames,
    week: weekInfo,
  }
}
