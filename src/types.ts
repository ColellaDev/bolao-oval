export interface Team {
  id: string
  displayName: string
  abbreviation: string
  logo: string
}

export interface Competitor {
  team: Team
}

export interface Competition {
  competitors: Competitor[]
}

export interface Game {
  id: string
  name: string
  date: string
  competitions: Competition[]
  homeTeamScore?: number | null
  awayTeamScore?: number | null
  winnerTeamId?: string | null
  status: string
}

export interface WeekInfo {
  number: number
  name: string
  seasonId: number
}