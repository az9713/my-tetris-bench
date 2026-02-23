'use client';

import { useEffect, useState } from 'react';

interface ModelStat {
  ai_model: string;
  total_games: number;
  ai_wins: number;
  avg_ai_score: number;
  avg_human_score: number;
  max_ai_score: number;
  win_rate: number;
}

interface HumanStat {
  player_name: string;
  total_games: number;
  wins: number;
  avg_score: number;
  max_score: number;
  win_rate: number;
}

interface RecentGame {
  id: number;
  player_name: string;
  human_score: number;
  ai_model: string;
  ai_score: number;
  winner: string;
  created_at: string;
}

export default function LeaderboardPage() {
  const [tab, setTab] = useState<'models' | 'humans' | 'recent'>('models');
  const [modelStats, setModelStats] = useState<ModelStat[]>([]);
  const [humanStats, setHumanStats] = useState<HumanStat[]>([]);
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setModelStats(data.modelStats || []);
        setHumanStats(data.humanStats || []);
        setRecentGames(data.recentGames || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-pixel text-center mb-8">
        <span className="text-yellow-400 neon-yellow">🏆</span>{' '}
        <span className="text-white">Leaderboard</span>
      </h1>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8">
        {(['models', 'humans', 'recent'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`font-pixel text-xs px-6 py-2 rounded-lg border transition-all uppercase ${
              tab === t
                ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10'
                : 'border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-500 font-pixel text-sm py-20">
          Loading...
        </div>
      ) : (
        <>
          {/* Model Stats */}
          {tab === 'models' && (
            <div className="overflow-x-auto">
              {modelStats.length === 0 ? (
                <EmptyState message="No games played yet. Start a battle to see model stats!" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 font-pixel border-b border-gray-800">
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Model</th>
                      <th className="text-right py-3 px-4">Win Rate</th>
                      <th className="text-right py-3 px-4">Games</th>
                      <th className="text-right py-3 px-4">Avg Score</th>
                      <th className="text-right py-3 px-4">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelStats.map((stat, i) => (
                      <tr key={stat.ai_model} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-3 px-4 font-pixel text-sm text-gray-600">{i + 1}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-fuchsia-400">{stat.ai_model}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-yellow-400">{stat.win_rate}%</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-gray-400">{stat.total_games}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-gray-300">{stat.avg_ai_score}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-emerald-400">{stat.max_ai_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Human Stats */}
          {tab === 'humans' && (
            <div className="overflow-x-auto">
              {humanStats.length === 0 ? (
                <EmptyState message="No human stats yet. Play some games!" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 font-pixel border-b border-gray-800">
                      <th className="text-left py-3 px-4">#</th>
                      <th className="text-left py-3 px-4">Player</th>
                      <th className="text-right py-3 px-4">Win Rate</th>
                      <th className="text-right py-3 px-4">Games</th>
                      <th className="text-right py-3 px-4">Avg Score</th>
                      <th className="text-right py-3 px-4">Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {humanStats.map((stat, i) => (
                      <tr key={stat.player_name + i} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-3 px-4 font-pixel text-sm text-gray-600">{i + 1}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-cyan-400">{stat.player_name}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-yellow-400">{stat.win_rate}%</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-gray-400">{stat.total_games}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-gray-300">{stat.avg_score}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-emerald-400">{stat.max_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Recent Games */}
          {tab === 'recent' && (
            <div className="overflow-x-auto">
              {recentGames.length === 0 ? (
                <EmptyState message="No recent games. Start a battle!" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-500 font-pixel border-b border-gray-800">
                      <th className="text-left py-3 px-4">Player</th>
                      <th className="text-right py-3 px-4">Score</th>
                      <th className="text-center py-3 px-4">vs</th>
                      <th className="text-left py-3 px-4">Model</th>
                      <th className="text-right py-3 px-4">Score</th>
                      <th className="text-center py-3 px-4">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentGames.map((game) => (
                      <tr key={game.id} className="border-b border-gray-800/50 hover:bg-gray-900/50">
                        <td className="py-3 px-4 font-pixel text-sm text-cyan-400">{game.player_name}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-gray-300">{game.human_score}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-center text-gray-600">vs</td>
                        <td className="py-3 px-4 font-pixel text-sm text-fuchsia-400">{game.ai_model}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-right text-gray-300">{game.ai_score}</td>
                        <td className="py-3 px-4 font-pixel text-sm text-center">
                          <span className={
                            game.winner === 'human' ? 'text-cyan-400' :
                            game.winner === 'ai' ? 'text-fuchsia-400' : 'text-yellow-400'
                          }>
                            {game.winner === 'human' ? '👤' : game.winner === 'ai' ? '🤖' : '🤝'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-20">
      <div className="text-4xl mb-4">🎮</div>
      <p className="text-gray-500 font-pixel text-xs">{message}</p>
    </div>
  );
}
