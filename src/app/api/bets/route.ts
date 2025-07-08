import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const week = searchParams.get('week')

  if (!userId || !week) {
    return NextResponse.json(
      { error: 'userId e week são obrigatórios' },
      { status: 400 },
    )
  }

  try {
    const bets = await prisma.bet.findMany({
      where: {
        userId,
        week: parseInt(week, 10),
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
    const { userId, week, bets } = await request.json()

    if (!userId || !week || !Array.isArray(bets) || bets.length === 0) {
      return NextResponse.json(
        { error: 'Dados inválidos para aposta.' },
        { status: 400 },
      )
    }

    const existingBetsCount = await prisma.bet.count({
      where: {
        userId,
        week,
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

    const betsToCreate = bets.map((bet: { gameId: string; choiceId: string }) => ({
      userId,
      week,
      gameId: bet.gameId,
      choiceId: bet.choiceId,
    }))

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
