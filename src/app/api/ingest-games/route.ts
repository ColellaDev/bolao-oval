import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const teamSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  abbreviation: z.string(),
  logo: z.string().url(),
})

const competitorSchema = z.object({
  team: teamSchema,
})

const gameSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string().datetime(),
  competitions: z.array(
    z.object({
      competitors: z.array(competitorSchema),
    }),
  ),
})

const espnResponseSchema = z.object({
  season: z.object({
    year: z.number(),
  }),
  week: z.object({
    number: z.number(),
    text: z.string().optional(), 
  }),
  events: z.array(gameSchema),
})

export async function POST() {
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      { next: { revalidate: 3600 } }, 
    )

    if (!response.ok) {
      throw new Error('Falha ao buscar dados da ESPN.')
    }

    const data = await response.json()

    const validatedData = espnResponseSchema.parse(data)

    const { season, week, events } = validatedData
    const seasonId = season.year
    const { number: weekNumber, text: weekText } = week
    const weekName = weekText || `Semana ${weekNumber}`

    const teamsMap = new Map<string, z.infer<typeof teamSchema>>()
    for (const event of events) {
      for (const competitor of event.competitions[0].competitors) {
        if (!teamsMap.has(competitor.team.id)) {
          teamsMap.set(competitor.team.id, competitor.team)
        }
      }
    }
    const uniqueTeams = Array.from(teamsMap.values())

    await prisma.$transaction(
      async (tx) => {
        const transactionPromises = []

        transactionPromises.push(
          tx.season.upsert({
            where: { id: seasonId },
            update: { name: `Temporada NFL ${seasonId}` },
            create: { id: seasonId, name: `Temporada NFL ${seasonId}` },
          }),
          tx.week.upsert({
            where: { seasonId_number: { seasonId, number: weekNumber } },
            update: { name: weekName },
            create: { number: weekNumber, name: weekName, seasonId },
          }),
        )

        for (const team of uniqueTeams) {
          transactionPromises.push(
            tx.team.upsert({
              where: { id: team.id },
              update: { ...team },
              create: { ...team },
            }),
          )
        }

        for (const event of events) {
          const [home, away] = event.competitions[0].competitors
          transactionPromises.push(
            tx.game.upsert({
              where: { id: event.id },
              update: { name: event.name, date: new Date(event.date) },
              create: {
                id: event.id,
                name: event.name,
                date: new Date(event.date),
                seasonId: seasonId,
                weekNumber: weekNumber,
                homeTeamId: home.team.id,
                awayTeamId: away.team.id,
              },
            }),
          )
        }

        await Promise.all(transactionPromises)
      },
      {
        timeout: 15000,
      },
    )

    return NextResponse.json({ message: 'Jogos atualizados com sucesso!' })
  } catch (error) {
    console.error('ERRO NA INGESTÃO DE JOGOS:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Estrutura de dados da API externa mudou.',
          details: error.issues,
        },
        { status: 500 },
      )
    }
    return NextResponse.json(
      { error: 'Falha na ingestão de dados' },
      { status: 500 },
    )
  }
}
