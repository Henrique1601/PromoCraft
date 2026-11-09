import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';
import { getDb } from '@/lib/db';
import { parseSteamInput, resolveSteamId64, fetchSteamWishlistAppIds, SteamWishlistItem } from '@/lib/steam';
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

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
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

    const { identifier, isSteamId64 } = parseSteamInput(steamInput);

    if (!identifier) {
      return NextResponse.json(
        { error: 'Formato de perfil ou link do Steam inválido.' },
        { status: 400 }
      );
    }

    // Resolve o identificador (URL, vanity name ou ID numérico) para um SteamID64 oficial de 17 dígitos
    const steamId64 = await resolveSteamId64(identifier, isSteamId64);

    if (!steamId64) {
      return NextResponse.json(
        {
          error:
            'Não foi possível localizar o perfil Steam correspondente. Verifique se o link ou nome de usuário foi digitado corretamente.',
        },
        { status: 404 }
      );
    }

    // Busca a lista de desejos via IWishlistService oficial da Valve (retorna todos os itens)
    const wishlistItems: SteamWishlistItem[] = await fetchSteamWishlistAppIds(steamId64);

    // Se a wishlist pública não retornar nenhum item
    if (wishlistItems.length === 0) {
      return NextResponse.json({
        success: true,
        foundOnSteam: 0,
        importedCount: 0,
        importedGames: [],
        message:
          'Nenhum jogo encontrado na lista de desejos. Por favor, certifique-se de que nas opções de privacidade do seu perfil Steam tanto o perfil quanto os Detalhes dos Jogos estejam configurados como Públicos.',
      });
    }

    // Persistência secundária no SQLite de forma não-bloqueante
    let db: any = null;
    try {
      db = getDb();
    } catch (dbErr) {
      console.warn('Banco de dados local não disponível em ambiente serverless, utilizando persistência híbrida:', dbErr);
    }

    const userAgent = 'PromoCraft/2.1 (https://promocraft.netlify.app; contact@promocraft.app)';

    // ABORDAGEM 1: IMPORTAÇÃO TOTAL COM ENRIQUECIMENTO HÍBRIDO
    // Todos os jogos da wishlist serão importados.
    // 1. Enriquecemos metadados oficiais via Steam Store API em lotes concorrentes (até 60 jogos)
    // 2. Consultamos ofertas CheapShark para os jogos prioritários (até 25 jogos)
    // 3. Os demais jogos são importados com artes CDN oficiais e sincronização progressiva

    const MAX_STEAM_METADATA = 60;
    const MAX_CHEAPSHARK_DEALS = 25;

    const itemsToEnrich = wishlistItems.slice(0, MAX_STEAM_METADATA);
    const steamDetailsMap = new Map<string, { name: string; headerImage: string; priceBRL: number | null; normalBRL: number | null; discount: number }>();

    // Processa detalhes do Steam Store em lotes paralelos de 10
    const detailChunks = chunkArray(itemsToEnrich, 10);
    for (const chunk of detailChunks) {
      await Promise.allSettled(
        chunk.map(async (item) => {
          const appId = String(item.appid);
          try {
            const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&l=brazilian`, {
              headers: { 'User-Agent': userAgent },
              signal: AbortSignal.timeout(3500),
            });
            if (res.ok) {
              const data = await res.json().catch(() => null);
              const appData = data?.[appId]?.data;
              if (appData && appData.name) {
                const priceOverview = appData.price_overview;
                steamDetailsMap.set(appId, {
                  name: appData.name,
                  headerImage: appData.header_image || `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
                  priceBRL: priceOverview ? priceOverview.final / 100 : null,
                  normalBRL: priceOverview ? priceOverview.initial / 100 : null,
                  discount: priceOverview ? priceOverview.discount_percent : 0,
                });
              }
            }
          } catch {
            // Silencia falhas individuais de rede
          }
        })
      );
    }

    // Processa CheapShark para os primeiros jogos prioritários
    const csDealsMap = new Map<string, { gameID: string; title: string; thumb?: string; cheapestUSD: number | null }>();
    const csTargets = wishlistItems.slice(0, MAX_CHEAPSHARK_DEALS);
    const csChunks = chunkArray(csTargets, 10);

    for (const chunk of csChunks) {
      await Promise.allSettled(
        chunk.map(async (item) => {
          const appId = String(item.appid);
          try {
            const res = await fetch(`https://www.cheapshark.com/api/1.0/games?steamAppID=${appId}`, {
              headers: { 'User-Agent': userAgent },
              signal: AbortSignal.timeout(3500),
            });
            if (res.ok) {
              const data = await res.json().catch(() => null);
              if (Array.isArray(data) && data.length > 0) {
                const g = data[0];
                csDealsMap.set(appId, {
                  gameID: g.gameID,
                  title: g.external,
                  thumb: g.thumb,
                  cheapestUSD: parseFloat(g.cheapest) || null,
                });
              }
            }
          } catch {
            // Silencia falhas individuais
          }
        })
      );
    }

    // Monta a lista completa de jogos importados para 100% dos itens da wishlist
    const importedGames: ImportedGameItem[] = [];

    for (const item of wishlistItems) {
      const appId = String(item.appid);
      const steamInfo = steamDetailsMap.get(appId);
      const csInfo = csDealsMap.get(appId);

      const title = csInfo?.title || steamInfo?.name || `Jogo Steam #${appId}`;
      const thumb =
        csInfo?.thumb ||
        steamInfo?.headerImage ||
        `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
      const gameID = csInfo?.gameID || `steam_${appId}`;
      const price = csInfo?.cheapestUSD ?? steamInfo?.priceBRL ?? null;

      const gameItem: ImportedGameItem = {
        id: crypto.randomUUID(),
        gameID,
        title,
        thumb,
        steamAppID: appId,
        cheapestPriceEver: null,
        currentBestPrice: price,
        salePrice: price,
        normalPrice: steamInfo?.normalBRL || price,
        savings: steamInfo?.discount || 0,
        createdAt: new Date().toISOString(),
      };

      importedGames.push(gameItem);
    }

    // Persistência em lote no SQLite caso o banco esteja operacional
    if (db && importedGames.length > 0) {
      try {
        const stmt = db.prepare(`
          INSERT INTO wishlist (id, gameID, title, thumb, steamAppID, cheapestPriceEver, currentBestPrice)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(gameID) DO UPDATE SET
            currentBestPrice = excluded.currentBestPrice,
            thumb = excluded.thumb,
            title = excluded.title
        `);
        for (const g of importedGames) {
          try {
            stmt.run(
              g.id,
              g.gameID,
              g.title,
              g.thumb || '',
              g.steamAppID || '',
              null,
              g.currentBestPrice
            );
          } catch {}
        }
      } catch (dbErr) {
        console.warn('Erro ao persistir lote da wishlist no SQLite:', dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      foundOnSteam: wishlistItems.length,
      importedCount: importedGames.length,
      importedGames,
      titles: importedGames.map((g) => g.title),
      message: `Importados com sucesso todos os ${importedGames.length} jogos da sua lista de desejos do Steam!`,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/wishlist/import-steam:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro interno ao processar sincronização com Steam.' },
      { status: 500 }
    );
  }
}
