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
          { sl: 'desc' }, 
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

    let rank = 1
    const rankedScores = scores.map((score, index, allScores) => {
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
