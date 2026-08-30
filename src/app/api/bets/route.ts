import { NextResponse } from 'next/server'
import {
  BetConflictError,
  ValidationError,
  createUserBetsForWeek,
  getUserBetsForWeek,
} from '@/services/betService'

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
    const bets = await getUserBetsForWeek({
      userId,
      seasonId: Number.parseInt(seasonId, 10),
      weekNumber: Number.parseInt(weekNumber, 10),
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
    const payload = await request.json()
    await createUserBetsForWeek(payload)

    return NextResponse.json(
      { message: 'Apostas criadas com sucesso' },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      )
    }

    if (error instanceof BetConflictError) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 },
      )
    }

    console.error('Erro ao salvar aposta:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
