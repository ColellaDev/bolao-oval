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
  score: z.string().optional(),
  winner: z.boolean().optional(),
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
  status: z.object({
    type: z.object({ completed: z.boolean() }),
  }),
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

const ingestBodySchema = z.object({
  week: z.number().optional(),
  season: z.number().optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { week: requestedWeek, season: requestedSeason } =
      ingestBodySchema.parse(body)

    const url = new URL(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
    )
    if (requestedWeek) url.searchParams.append('week', String(requestedWeek))
    if (requestedSeason) url.searchParams.append('year', String(requestedSeason))

    const response = await fetch(url.toString(), { next: { revalidate: 3600 } })

    if (!response.ok) {
      throw new Error('Falha ao buscar dados da ESPN.')
    }

    const data = await response.json()

    const validatedData = espnResponseSchema.parse(data)

    const { season, week, events } = validatedData
    const seasonId = season.year
    const { number: weekNumber, text: weekText } = week
    const weekName = weekText || `Semana ${weekNumber}`

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

        for (const event of events) {
          const [home, away] = event.competitions[0].competitors
          const winnerTeamId = home.winner
            ? home.team.id
            : away.winner
              ? away.team.id
              : null

          transactionPromises.push(
            tx.game.upsert({
              where: { id: event.id },
              update: {
                name: event.name,
                date: new Date(event.date),
                status: event.status.type.completed ? 'FINAL' : 'IN_PROGRESS',
                homeTeamScore: home.score ? parseInt(home.score, 10) : null,
                awayTeamScore: away.score ? parseInt(away.score, 10) : null,
                winnerTeamId,
              },
              create: {
                id: event.id,
                name: event.name,
                date: new Date(event.date),
                seasonId: seasonId,
                weekNumber: weekNumber,
                status: event.status.type.completed ? 'FINAL' : 'SCHEDULED',
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
