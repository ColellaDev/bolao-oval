'use client'

import { useState } from 'react'

const jogos = [
  { id: 1, game: 'Patriots vs Dolphins', teams: ['Patriots', 'Dolphins'] },
  { id: 2, game: 'Commanders vs Panthers', teams: ['Commanders', 'Panthers'] },
  { id: 3, game: 'Chargers vs Packers', teams: ['Chargers', 'Packers'] },
]

export default function BetFormPage() {
  const [userId, setUserId] = useState('')
  const [palpites, setPalpites] = useState<{ [key: number]: string }>({})
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handlePalpite = (jogoId: number, time: string) => {
    setPalpites((prev) => ({
      ...prev,
      [jogoId]: time
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      alert('Informe o ID do usuário.')
      return
    }

    if (Object.keys(palpites).length < jogos.length) {
      alert('Você precisa escolher um time para cada jogo.')
      return
    }

    try {
      for (const jogo of jogos) {
        await fetch('/api/bets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            week: 1,
            game: jogo.game,
            choice: palpites[jogo.id]
          })
        })
      }

      setStatus('success')
      setUserId('')
      setPalpites({})
    } catch (error) {
      console.error('Erro ao enviar apostas:', error)
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-zinc-900 text-white py-10 px-4">
      <div className="max-w-xl mx-auto bg-zinc-800 rounded-xl shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Bolão - Semana 1 🏈</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            className="w-full border border-zinc-600 bg-zinc-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            placeholder="ID do Usuário"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />

          {jogos.map((jogo) => (
            <div key={jogo.id} className="bg-zinc-700 rounded-lg p-4">
              <p className="text-lg font-semibold mb-3 text-center">{jogo.game}</p>
              <div className="flex gap-4 justify-center">
                {jogo.teams.map((time) => (
                  <button
                    key={time}
                    type="button"
                    className={`flex-1 py-2 rounded-lg font-bold border shadow-md transition-all
                      ${
                        palpites[jogo.id] === time
                          ? 'bg-blue-600 border-blue-700 text-white'
                          : 'bg-zinc-200 text-zinc-900 hover:bg-zinc-300'
                      }`}
                    onClick={() => handlePalpite(jogo.id, time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white py-3 rounded-lg font-bold shadow-lg"
          >
            Enviar Apostas
          </button>

          {status === 'success' && (
            <p className="text-green-400 text-center font-semibold">✅ Apostas enviadas com sucesso!</p>
          )}
          {status === 'error' && (
            <p className="text-red-400 text-center font-semibold">❌ Erro ao enviar apostas.</p>
          )}
        </form>
      </div>
    </main>
  )
}
