import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const routeContextSchema = z.object({
  params: z.object({
    seasonId: z.coerce.number().int().positive(),
  }),
})

export async function GET(
  request: Request,
  context: z.infer<typeof routeContextSchema>,
) {
  try {
    const { params } = routeContextSchema.parse(context)
    const { seasonId } = params

    const scores = await prisma.userSeasonScore.findMany({
      where: {
        seasonId,
      },
        orderBy: [
          { score: 'desc' }, 
          { sl: 'asc' }, 
        ],
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
    })

    const rankedScores = scores.map((score, index) => ({
      ...score,
      rank: index + 1, 
    }))

    return NextResponse.json({
      ranking: rankedScores,
      totalUsers: rankedScores.length,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    console.error('Erro ao buscar o ranking:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
