'use client'

import { useState, useEffect } from 'react';

interface Team {
  id: string;
  displayName: string;
  logos: { href: string }[]; 
}

export default function TestApiPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listResponse = await fetch("http://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/teams");
        if (!listResponse.ok) {
          throw new Error(`Erro ao buscar lista: ${listResponse.status}`);
        }
        const listJson = await listResponse.json();

        const teamPromises = listJson.items.map((item: { $ref: string }) =>
          fetch(item.$ref).then(res => res.json())
        );

        const teamsData = await Promise.all(teamPromises);

        setTeams(teamsData);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (error) {
    return <p>Erro: {error}</p>;
  }

  return (
    <div>
      <h1>Nomes dos Times da NFL:</h1>
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="flex items-center gap-2 my-2">
            <img
              src={team.logos[0].href}
              alt={`Logo do ${team.displayName}`}
              width="25"
              className="h-auto"
            />
            <span>{team.displayName}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
