import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ingestGamesForWeek } from '@/services/ingestGamesService'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const result = await ingestGamesForWeek(body)

    return NextResponse.json(result)
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
