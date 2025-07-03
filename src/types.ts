export interface Team {
  id: string
  displayName: string
  abbreviation: string
  logo: string
}

export interface Competitor {
  id: string
  team: Team
  homeAway: 'home' | 'away'
}

export interface Competition {
  id: string
  competitors: Competitor[]
}

export interface Game {
  id: string
  name: string
  shortName: string
  date: string
  competitions: Competition[]
}