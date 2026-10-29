import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function GET() {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM wishlist ORDER BY createdAt DESC').all();
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { gameID, title, thumb, steamAppID, cheapestPriceEver, currentBestPrice, targetPrice, email } = body;

    if (!gameID || !title) {
      return NextResponse.json({ error: 'gameID e title são obrigatórios' }, { status: 400 });
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const stmt = db.prepare(`
      INSERT INTO wishlist (id, gameID, title, thumb, steamAppID, cheapestPriceEver, currentBestPrice, targetPrice, email)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(gameID) DO UPDATE SET
        targetPrice = excluded.targetPrice,
        email = excluded.email,
        currentBestPrice = excluded.currentBestPrice
    `);

    stmt.run(
      id,
      gameID,
      title,
      thumb || '',
      steamAppID || '',
      cheapestPriceEver ? parseFloat(cheapestPriceEver) : null,
      currentBestPrice ? parseFloat(currentBestPrice) : null,
      targetPrice ? parseFloat(targetPrice) : null,
      email || ''
    );

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameID = searchParams.get('gameID');

    if (!gameID) {
      return NextResponse.json({ error: 'gameID é obrigatório' }, { status: 400 });
    }

    const db = getDb();
    db.prepare('DELETE FROM wishlist WHERE gameID = ?').run(gameID);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
