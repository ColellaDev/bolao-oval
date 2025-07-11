import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const seasonId = searchParams.get('seasonId')
  const weekNumber = searchParams.get('weekNumber')

  if (!userId || !seasonId || !weekNumber) {
    return NextResponse.json(
      { error: 'userId, seasonId e weekNumber são obrigatórios' },
      { status: 400 },
    )
  }

  try {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        seasonId: parseInt(seasonId, 10),
        weekNumber: parseInt(weekNumber, 10),
      },
    })
    return NextResponse.json({ bets })
  } catch (error) {
    console.error('Erro ao buscar apostas:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const { userId, seasonId, weekNumber, bets } = await request.json()

    if (
      !userId ||
      !seasonId ||
      !weekNumber ||
      !Array.isArray(bets) ||
      bets.length === 0
    ) {
      return NextResponse.json(
        { error: 'Dados inválidos para aposta.' },
        { status: 400 },
      )
    }

    const existingBetsCount = await prisma.bet.count({
      where: {
        userId,
        seasonId,
        weekNumber,
      },
    })

    if (existingBetsCount > 0) {
      return NextResponse.json(
        {
          error:
            'Você já enviou suas apostas para esta semana e não pode alterá-las.',
        },
        { status: 409 }, 
      )
    }

    const betsToCreate = bets.map(
      (bet: { gameId: string; choiceId: string }) => ({
        userId,
        seasonId,
        weekNumber,
        gameId: bet.gameId,
        choiceId: bet.choiceId,
      }),
    )

    await prisma.bet.createMany({
      data: betsToCreate,
    })

    return NextResponse.json(
      { message: 'Apostas criadas com sucesso' },
      { status: 201 },
    )
  } catch (error) {
    console.error('Erro ao salvar aposta:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
