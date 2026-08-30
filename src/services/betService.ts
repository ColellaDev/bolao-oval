import { prisma } from '@/lib/prisma'

export type BetInput = {
  gameId: string
  choiceId: string
}

export type CreateBetPayload = {
  userId: string
  seasonId: number
  weekNumber: number
  bets: BetInput[]
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class BetConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BetConflictError'
  }
}

export async function getUserBetsForWeek({
  userId,
  seasonId,
  weekNumber,
}: {
  userId: string
  seasonId: number
  weekNumber: number
}) {
  return prisma.bet.findMany({
    where: {
      userId,
      seasonId,
      weekNumber,
    },
  })
}

export function normalizeBetPayload(payload: unknown): CreateBetPayload {
  if (!payload || typeof payload !== 'object') {
    throw new ValidationError('Dados inválidos para aposta.')
  }

  const { userId, seasonId, weekNumber, bets } = payload as Partial<CreateBetPayload>

  if (!userId || !seasonId || !weekNumber || !Array.isArray(bets) || bets.length === 0) {
    throw new ValidationError('Dados inválidos para aposta.')
  }

  const parsedSeasonId = Number(seasonId)
  const parsedWeekNumber = Number(weekNumber)

  if (!Number.isInteger(parsedSeasonId) || !Number.isInteger(parsedWeekNumber)) {
    throw new ValidationError('Dados inválidos para aposta.')
  }

  const normalizedBets = bets.map((bet) => {
    if (!bet || typeof bet !== 'object') {
      throw new ValidationError('Cada aposta precisa conter gameId e choiceId.')
    }

    const { gameId, choiceId } = bet as Partial<BetInput>

    if (!gameId || !choiceId) {
      throw new ValidationError('Cada aposta precisa conter gameId e choiceId.')
    }

    return {
      gameId,
      choiceId,
    }
  })

  return {
    userId,
    seasonId: parsedSeasonId,
    weekNumber: parsedWeekNumber,
    bets: normalizedBets,
  }
}

export async function createUserBetsForWeek(payload: unknown) {
  const normalizedPayload = normalizeBetPayload(payload)

  const existingBetsCount = await prisma.bet.count({
    where: {
      userId: normalizedPayload.userId,
      seasonId: normalizedPayload.seasonId,
      weekNumber: normalizedPayload.weekNumber,
    },
  })

  if (existingBetsCount > 0) {
    throw new BetConflictError(
      'Você já enviou suas apostas para esta semana e não pode alterá-las.',
    )
  }

  const betsToCreate = normalizedPayload.bets.map((bet) => ({
    userId: normalizedPayload.userId,
    seasonId: normalizedPayload.seasonId,
    weekNumber: normalizedPayload.weekNumber,
    gameId: bet.gameId,
    choiceId: bet.choiceId,
  }))

  await prisma.bet.createMany({
    data: betsToCreate,
  })

  return {
    created: betsToCreate.length,
  }
}
