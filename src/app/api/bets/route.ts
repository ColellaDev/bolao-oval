import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { userId, week, game, choice } = body;

    if (!userId || !week || !game || !choice) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    const bet = await prisma.bet.create({
      data: {
        userId,
        week,
        game,
        choice,
      },
    });

    return NextResponse.json(bet, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar aposta:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
