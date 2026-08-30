import { NextResponse } from 'next/server'
import { getCurrentGamesPayload } from '@/services/gamesService'

export async function GET() {
  try {
    const payload = await getCurrentGamesPayload()

    if (payload.error) {
      return NextResponse.json(payload, { status: 404 })
    }

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Erro ao buscar jogos do banco de dados:', error)
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 },
    )
  }
}
