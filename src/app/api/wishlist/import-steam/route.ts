import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';
import { getDb } from '@/lib/db';
import { parseSteamInput, resolveSteamId64, fetchSteamWishlistAppIds } from '@/lib/steam';
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

    // Busca a lista de desejos via IWishlistService oficial da Valve
    const wishlistItems = await fetchSteamWishlistAppIds(steamId64);

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

    const importedGames: ImportedGameItem[] = [];

    // Persistência secundária no SQLite de forma não-bloqueante
    let db: any = null;
    try {
      db = getDb();
    } catch (dbErr) {
      console.warn('Banco de dados local não disponível em ambiente serverless, utilizando persistência híbrida:', dbErr);
    }

    // Processa até 25 jogos prioritários da wishlist para enriquecer com ofertas
    const targetItems = wishlistItems.slice(0, 25);
    const userAgent = 'PromoCraft/2.1 (https://promocraft.netlify.app; contact@promocraft.app)';

    for (const item of targetItems) {
      const appId = String(item.appid);

      try {
        let gameItem: ImportedGameItem | null = null;

        // 1ª Tentativa: Busca direta no CheapShark por steamAppID
        const csRes = await fetch(
          `https://www.cheapshark.com/api/1.0/games?steamAppID=${appId}`,
          {
            headers: { 'User-Agent': userAgent },
            signal: AbortSignal.timeout(4500),
          }
        ).catch(() => null);

        if (csRes && csRes.ok) {
          const csData = await csRes.json().catch(() => null);
          if (Array.isArray(csData) && csData.length > 0) {
            const csGame = csData[0];
            const cheapestUSD = parseFloat(csGame.cheapest) || null;

            gameItem = {
              id: crypto.randomUUID(),
              gameID: csGame.gameID,
              title: csGame.external || `Game #${appId}`,
              thumb:
                csGame.thumb ||
                `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`,
              steamAppID: appId,
              cheapestPriceEver: null,
              currentBestPrice: cheapestUSD,
              salePrice: cheapestUSD,
              normalPrice: cheapestUSD,
              savings: 0,
              createdAt: new Date().toISOString(),
            };
          }
        }

        // 2ª Tentativa: Se CheapShark não encontrou por steamAppID, consulta Steam Store appdetails
        if (!gameItem) {
          try {
            const steamDetailRes = await fetch(
              `https://store.steampowered.com/api/appdetails?appids=${appId}&l=brazilian`,
              {
                headers: { 'User-Agent': userAgent },
                signal: AbortSignal.timeout(4000),
              }
            ).catch(() => null);

            if (steamDetailRes && steamDetailRes.ok) {
              const steamDetailData = await steamDetailRes.json().catch(() => null);
              const appData = steamDetailData?.[appId]?.data;

              if (appData && appData.name) {
                const title = appData.name;
                const headerImage =
                  appData.header_image ||
                  `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
                const priceOverview = appData.price_overview;
                const steamPriceBRL = priceOverview ? priceOverview.final / 100 : null;
                const steamNormalBRL = priceOverview ? priceOverview.initial / 100 : null;
                const steamDiscount = priceOverview ? priceOverview.discount_percent : 0;

                // Tenta casar com ofertas CheapShark pelo título
                const deals = await fetchDeals({ title, pageSize: 1 }).catch(() => []);
                if (deals && deals.length > 0) {
                  const deal = deals[0];
                  gameItem = {
                    id: crypto.randomUUID(),
                    gameID: deal.gameID,
                    title: deal.title || title,
                    thumb: deal.thumb || headerImage,
                    steamAppID: deal.steamAppID || appId,
                    cheapestPriceEver: null,
                    currentBestPrice: parseFloat(deal.salePrice) || steamPriceBRL,
                    salePrice: parseFloat(deal.salePrice) || steamPriceBRL,
                    normalPrice: parseFloat(deal.normalPrice) || steamNormalBRL,
                    savings: parseFloat(deal.savings) || steamDiscount,
                    createdAt: new Date().toISOString(),
                  };
                } else {
                  // Fallback enriquecido diretamente com metadados oficiais Steam
                  gameItem = {
                    id: crypto.randomUUID(),
                    gameID: `steam_${appId}`,
                    title,
                    thumb: headerImage,
                    steamAppID: appId,
                    cheapestPriceEver: null,
                    currentBestPrice: steamPriceBRL,
                    salePrice: steamPriceBRL,
                    normalPrice: steamNormalBRL,
                    savings: steamDiscount,
                    createdAt: new Date().toISOString(),
                  };
                }
              }
            }
          } catch (steamErr) {
            console.warn(`Consulta aos detalhes Steam do appId ${appId} falhou:`, steamErr);
          }
        }

        // Se conseguiu montar o item, adiciona e persiste no SQLite
        if (gameItem) {
          importedGames.push(gameItem);

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
      } catch (itemErr) {
        console.warn(`Erro ao processar item ${appId} da wishlist:`, itemErr);
      }
    }

    return NextResponse.json({
      success: true,
      foundOnSteam: wishlistItems.length,
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
