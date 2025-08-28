export interface Winner {
  place: number | 'adesivo'
  name: string
  score: number
}

export interface BolaoSeason {
  season: string
  winners: Winner[]
}

export const hallOfFameData: BolaoSeason[] = [
  {
    season: 'Bolão Oval I - 2015',
    winners: [
      { place: 1, name: 'Pedrinho', score: 157 },
      { place: 2, name: 'Lele', score: 155 },
      { place: 3, name: 'Destro', score: 153 },
      { place: 'adesivo', name: 'Marcos', score: 141 },
      { place: 4, name: 'TESTE 4', score: 141 },
      { place: 5, name: 'TESTE 5', score: 141 },
    ],
  },
  {
    season: 'Bolão Oval II - 2016',
    winners: [
      { place: 1, name: 'Marcos', score: 187 },
      { place: 2, name: 'Caco', score: 184 },
      { place: 3, name: 'Destro', score: 182 },
      { place: 'adesivo', name: 'Renan', score: 170 },
    ],
  },
  {
    season: 'Bolão Oval III - 2017',
    winners: [
      { place: 1, name: 'Destro', score: 181 },
      { place: 2, name: 'Marcos', score: 180 },
      { place: 3, name: 'Erick', score: 180 },
      { place: 'adesivo', name: 'Caco', score: 173 },
    ],
  },
  {
    season: 'Bolão Oval IV - 2018',
    winners: [
      { place: 1, name: 'Igor', score: 184 },
      { place: 2, name: 'Helder', score: 181 },
      { place: 3, name: 'Marcos', score: 180 },
      { place: 'adesivo', name: 'Yuri', score: 179 },
    ],
  },
  {
    season: 'Bolão Oval V - 2019',
    winners: [
      { place: 1, name: 'Caco', score: 186 },
      { place: 2, name: 'Bruna', score: 181 },
      { place: 3, name: 'Pedrinho', score: 179 },
      { place: 'adesivo', name: 'Lele', score: 176 },
    ],
  },
  {
    season: 'Bolão Oval VI - 2020',
    winners: [
      { place: 1, name: 'Marcos', score: 197 },
      { place: 2, name: 'Igor', score: 196 },
      { place: 3, name: 'Erick', score: 194 },
      { place: 'adesivo', name: 'Lele', score: 189 },
    ],
  },
  {
    season: 'Bolão Oval VII - 2021',
    winners: [
      { place: 1, name: 'Diego', score: 202 },
      { place: 2, name: 'Rena', score: 194 },
      { place: 3, name: 'Destro', score: 190 },
      { place: 'adesivo', name: 'Samir', score: 185 },
    ],
  },
  {
    season: 'Bolão Oval VIII - 2022',
    winners: [
      { place: 1, name: 'Marcos', score: 192 },
      { place: 2, name: 'Luis', score: 191 },
      { place: 3, name: 'Caco', score: 189 },
      { place: 'adesivo', name: 'Lele', score: 185 },
    ],
  },
  {
    season: 'Bolão Oval IX - 2023',
    winners: [
      { place: 1, name: 'Marcos', score: 201 },
      { place: 2, name: 'Diego', score: 200 },
      { place: 3, name: 'Destro', score: 194 },
      { place: 'adesivo', name: 'Erick', score: 183 },
    ],
  },
  {
    season: 'Bolão Oval X - 2024',
    winners: [
      { place: 1, name: 'Caco', score: 214 },
      { place: 2, name: 'Marcos', score: 213 },
      { place: 3, name: 'Pedrinho', score: 204 },
      { place: 'adesivo', name: 'Helder', score: 198 },
    ],
  },
]