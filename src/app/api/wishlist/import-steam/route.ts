import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';
import { getDb } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { steamInput } = await req.json();
    if (!steamInput || typeof steamInput !== 'string') {
      return NextResponse.json({ error: 'Identificador do Steam é obrigatório' }, { status: 400 });
    }

    // Normaliza input (pode ser link do perfil, ID ou vanity)
    const cleaned = steamInput
      .replace(/https?:\/\/(www\.)?steamcommunity\.com\/(id|profiles)\//, '')
      .replace(/\/.*$/, '')
      .trim();

    if (!cleaned) {
      return NextResponse.json({ error: 'Formato de ID ou link inválido' }, { status: 400 });
    }

    // Consulta os jogos da lista de desejos pública via Steam Store API
    const steamWishlistUrl = `https://store.steampowered.com/wishlist/id/${encodeURIComponent(
      cleaned
    )}/wishlistdata/?p=0`;

    let steamData: Record<string, any> = {};
    try {
      const res = await fetch(steamWishlistUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      if (res.ok) {
        steamData = await res.json();
      }
    } catch (e) {
      // Ignora erro se perfil for privado ou 302
    }

    const appIds = Object.keys(steamData || {});
    const importedGames = [];
    const db = getDb();

    // Se a wishlist pública retornar itens
    if (appIds.length > 0) {
      for (const appId of appIds.slice(0, 15)) {
        const item = steamData[appId];
        const title = item.name || '';
        if (title) {
          // Busca gameID no CheapShark
          const deals = await fetchDeals({ title, pageSize: 1 });
          if (deals.length > 0) {
            const deal = deals[0];
            const id = crypto.randomUUID();
            db.prepare(`
              INSERT INTO wishlist (id, gameID, title, thumb, steamAppID, cheapestPriceEver, currentBestPrice)
              VALUES (?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(gameID) DO NOTHING
            `).run(
              id,
              deal.gameID,
              deal.title,
              deal.thumb,
              deal.steamAppID || appId,
              null,
              parseFloat(deal.salePrice)
            );
            importedGames.push(deal.title);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      foundOnSteam: appIds.length,
      importedCount: importedGames.length,
      importedGames,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
