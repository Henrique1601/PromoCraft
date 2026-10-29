import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { fetchGameDetails } from '@/lib/cheapshark';
import { getDirectStoreUrl } from '@/lib/links';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM wishlist WHERE targetPrice IS NOT NULL AND targetPrice > 0').all() as any[];
    const triggeredAlerts = [];

    const USD_TO_BRL = 5.75;

    for (const item of items) {
      const details = await fetchGameDetails(item.gameID);
      if (details && details.deals && details.deals.length > 0) {
        // Menor preço atual
        const bestDeal = details.deals.reduce((min, d) => 
          parseFloat(d.price) < parseFloat(min.price) ? d : min, details.deals[0]
        );
        const currentPrice = parseFloat(bestDeal.price);

        // Atualizar no banco
        db.prepare('UPDATE wishlist SET currentBestPrice = ? WHERE gameID = ?').run(currentPrice, item.gameID);

        // Meta atingida
        if (currentPrice <= item.targetPrice) {
          const alertPayload = {
            gameID: item.gameID,
            title: item.title,
            targetPrice: item.targetPrice,
            currentPrice,
            email: item.email,
            discordWebhook: item.discordWebhook,
            dealID: bestDeal.dealID,
            storeID: bestDeal.storeID,
          };

          triggeredAlerts.push(alertPayload);

          // Disparo automático via Webhook do Discord (se configurado)
          if (item.discordWebhook && item.discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
            try {
              const directUrl = getDirectStoreUrl(bestDeal.dealID, bestDeal.storeID, item.steamAppID, item.title);
              await fetch(item.discordWebhook, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  username: 'PromoCraft Alertas',
                  avatar_url: 'https://promocraft.netlify.app/apple-touch-icon.png',
                  embeds: [
                    {
                      title: `🚨 Alerta de Preço: ${item.title}`,
                      description: `O jogo atingiu a sua meta de preço!\n\n**Preço Atual:** R$ ${(currentPrice * USD_TO_BRL).toFixed(2).replace('.', ',')} ($ ${currentPrice.toFixed(2)})\n**Sua Meta:** R$ ${(item.targetPrice * USD_TO_BRL).toFixed(2).replace('.', ',')}`,
                      url: directUrl,
                      color: 0x10b981, // Cor esmeralda PromoCraft
                      thumbnail: { url: item.thumb },
                      fields: [
                        { name: 'Loja', value: `Loja ID: ${bestDeal.storeID}`, inline: true },
                        { name: 'Link de Compra', value: `[Comprar na Loja Oficial](${directUrl})`, inline: true },
                      ],
                      footer: { text: 'PromoCraft • Comparador em Tempo Real' },
                      timestamp: new Date().toISOString(),
                    },
                  ],
                }),
              });
            } catch (webhookErr) {
              console.error('Erro ao disparar Webhook Discord:', webhookErr);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkedCount: items.length,
      triggeredCount: triggeredAlerts.length,
      alerts: triggeredAlerts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
