'use client'

import { Game } from '@/types'

interface GameCardProps {
  game: Game
  palpite: string | undefined
  onPalpite: (jogoId: string, timeId: string) => void
  disabled: boolean;
}

export function GameCard({ game, palpite, onPalpite, disabled  }: GameCardProps) {
  return (
    <div key={game.id} className="bg-zinc-700 rounded-lg p-4">
      <p className="text-lg font-semibold mb-1 text-center">{game.name}</p>
      <p className="text-xs text-zinc-400 mb-3 text-center">
        {new Date(game.date).toLocaleString('pt-BR', {
          dateStyle: 'short',
          timeStyle: 'short'
        })}
      </p>
      <div className="flex gap-4 justify-center">
        {game.competitions[0].competitors.map((competitor) => (
          <button
            key={competitor.team.id}
            type="button"
            disabled={disabled} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold border shadow-md transition-all
              ${
                palpite === competitor.team.id
                  ? 'bg-blue-600 border-blue-700 text-white'
                  : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
              }`}
            onClick={() => onPalpite(game.id, competitor.team.id)}
          >
            <img src={competitor.team.logo} alt={competitor.team.displayName} className="w-6 h-6" />
            <span className="hidden sm:inline">{competitor.team.displayName}</span>
            <span className="sm:hidden">{competitor.team.abbreviation}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

