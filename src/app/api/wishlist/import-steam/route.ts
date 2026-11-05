import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';
import { getDb } from '@/lib/db';
import { getSteamWishlistUrls, parseSteamWishlistJson } from '@/lib/steam';
import crypto from 'crypto';

interface ImportedGameItem {
  id: string;
  gameID: string;
  title: string;
  thumb?: string;
  steamAppID?: string;
  cheapestPriceEver?: number | null;
  currentBestPrice?: number | null;
  salePrice?: number | null;
  normalPrice?: number | null;
  savings?: number;
  createdAt: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const steamInput = body?.steamInput;

    if (!steamInput || typeof steamInput !== 'string') {
      return NextResponse.json(
        { error: 'Identificador do Steam é obrigatório (link, vanity name ou SteamID64).' },
        { status: 400 }
      );
    }

    const { primaryUrl, fallbackUrl, identifier } = getSteamWishlistUrls(steamInput);

    if (!identifier) {
      return NextResponse.json(
        { error: 'Formato de perfil ou link do Steam inválido.' },
        { status: 400 }
      );
    }

    // Função interna com headers de browser para evitar bloqueio por bot
    const fetchWishlist = async (url: string): Promise<Record<string, any>> => {
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          },
          // Timeout rápido
          signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) return {};
        const text = await res.text();
        return parseSteamWishlistJson(text);
      } catch (err) {
        console.warn(`Tentativa de consulta Steam na URL ${url} falhou:`, err);
        return {};
      }
    };

    // 1ª Tentativa: URL primária
    let steamData = await fetchWishlist(primaryUrl);

    // 2ª Tentativa: Se vazio, tenta fallback alternando entre vanity e steamid64
    if (Object.keys(steamData).length === 0 && fallbackUrl) {
      steamData = await fetchWishlist(fallbackUrl);
    }

    const appIds = Object.keys(steamData || {});

    // Se a wishlist pública não retornar nenhum item
    if (appIds.length === 0) {
      return NextResponse.json({
        success: true,
        foundOnSteam: 0,
        importedCount: 0,
        importedGames: [],
        message:
          'Nenhum jogo encontrado na lista de desejos. Verifique se o perfil e a lista de desejos estão configurados como PÚBLICOS nas opções de privacidade do seu Steam.',
      });
    }

    const importedGames: ImportedGameItem[] = [];

    // Persistência secundária no SQLite de forma não-bloqueante
    let db: any = null;
    try {
      db = getDb();
    } catch (dbErr) {
      console.warn('Banco de dados local não disponível em ambiente serverless, utilizando persistência híbrida:', dbErr);
    }

    // Consulta os 15 primeiros jogos no CheapShark para vincular preços em tempo real
    const targetAppIds = appIds.slice(0, 15);

    for (const appId of targetAppIds) {
      const item = steamData[appId];
      const title = item?.name || '';
      if (!title) continue;

      try {
        const deals = await fetchDeals({ title, pageSize: 1 });
        if (deals && deals.length > 0) {
          const deal = deals[0];
          const gameItem: ImportedGameItem = {
            id: crypto.randomUUID(),
            gameID: deal.gameID,
            title: deal.title || title,
            thumb:
              deal.thumb ||
              item.capsule ||
              `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
            steamAppID: deal.steamAppID || appId,
            cheapestPriceEver: null,
            currentBestPrice: parseFloat(deal.salePrice) || null,
            salePrice: parseFloat(deal.salePrice) || null,
            normalPrice: parseFloat(deal.normalPrice) || null,
            savings: parseFloat(deal.savings) || 0,
            createdAt: new Date().toISOString(),
          };

          importedGames.push(gameItem);

          // Salvar no SQLite caso o banco esteja operacional
          if (db) {
            try {
              db.prepare(`
                INSERT INTO wishlist (id, gameID, title, thumb, steamAppID, cheapestPriceEver, currentBestPrice)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(gameID) DO UPDATE SET
                  currentBestPrice = excluded.currentBestPrice,
                  thumb = excluded.thumb
              `).run(
                gameItem.id,
                gameItem.gameID,
                gameItem.title,
                gameItem.thumb || '',
                gameItem.steamAppID || '',
                null,
                gameItem.currentBestPrice
              );
            } catch (insertErr) {
              // Silencia erros de inserção secundária no SQLite
            }
          }
        }
      } catch (dealErr) {
        console.warn(`Erro ao buscar oferta para o jogo ${title}:`, dealErr);
      }
    }

    return NextResponse.json({
      success: true,
      foundOnSteam: appIds.length,
      importedCount: importedGames.length,
      importedGames,
      titles: importedGames.map((g) => g.title),
    });
  } catch (error: any) {
    console.error('Erro na rota /api/wishlist/import-steam:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar sincronização com Steam.' },
      { status: 500 }
    );
  }
}
