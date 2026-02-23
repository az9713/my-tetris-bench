import { NextRequest, NextResponse } from 'next/server';
import { saveGame, getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const gameId = saveGame({
      humanPlayerId: data.humanPlayerId,
      humanScore: data.humanScore,
      aiModel: data.aiModel,
      aiScore: data.aiScore,
      winner: data.winner,
      durationSeconds: data.durationSeconds,
      seed: data.seed,
      aiInterventions: data.aiInterventions,
    });

    return NextResponse.json({ gameId });
  } catch (error) {
    console.error('Failed to save game:', error);
    return NextResponse.json({ error: 'Failed to save game' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = getDb();
    const games = db.prepare(`
      SELECT g.*, COALESCE(u.name, 'Guest') as player_name
      FROM games g
      LEFT JOIN users u ON g.human_player_id = u.id
      ORDER BY g.created_at DESC
      LIMIT 50
    `).all();

    return NextResponse.json({ games });
  } catch (error) {
    console.error('Failed to fetch games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}
