import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// Fallback em memória para ambientes serverless puros
const inMemorySessions = new Map<string, { data: string; expiresAt: number }>();

const CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

function generateSyncCode(length = 6): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const wishlist = body?.wishlist;

    if (!Array.isArray(wishlist)) {
      return NextResponse.json(
        { error: 'Dados da wishlist inválidos para sincronização.' },
        { status: 400 }
      );
    }

    const code = generateSyncCode();
    const dataString = JSON.stringify(wishlist);
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 horas

    // 1. Salvar no SQLite
    try {
      const db = getDb();
      db.prepare(`
        INSERT INTO sync_sessions (code, data, expiresAt)
        VALUES (?, ?, ?)
        ON CONFLICT(code) DO UPDATE SET data = excluded.data, expiresAt = excluded.expiresAt
      `).run(code, dataString, expiresAt);
    } catch (dbErr) {
      console.warn('Persistindo sessão de sincronização apenas em memória:', dbErr);
    }

    // 2. Salvar no fallback em memória
    inMemorySessions.set(code, { data: dataString, expiresAt });

    return NextResponse.json({
      success: true,
      code,
      itemCount: wishlist.length,
      expiresAt,
      message: `Código de sincronização gerado com sucesso! Válido por 24 horas.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao gerar sessão de sincronização.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code')?.trim().toUpperCase();

    if (!code || code.length < 4) {
      return NextResponse.json({ error: 'Código de sincronização inválido.' }, { status: 400 });
    }

    let rawData: string | null = null;
    const now = Date.now();

    // 1. Tenta buscar no SQLite
    try {
      const db = getDb();
      const row = db.prepare('SELECT data, expiresAt FROM sync_sessions WHERE code = ?').get(code) as any;
      if (row && row.expiresAt > now) {
        rawData = row.data;
      }
    } catch {}

    // 2. Fallback para memória
    if (!rawData) {
      const mem = inMemorySessions.get(code);
      if (mem && mem.expiresAt > now) {
        rawData = mem.data;
      }
    }

    if (!rawData) {
      return NextResponse.json(
        { error: 'Código de sincronização não encontrado ou já expirado. Por favor, gere um novo código no dispositivo de origem.' },
        { status: 404 }
      );
    }

    const wishlist = JSON.parse(rawData);

    return NextResponse.json({
      success: true,
      code,
      itemCount: wishlist.length,
      wishlist,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Erro ao recuperar sessão de sincronização.' }, { status: 500 });
  }
}
