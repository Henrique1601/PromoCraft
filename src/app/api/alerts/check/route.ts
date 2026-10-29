import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { fetchGameDetails } from '@/lib/cheapshark';

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const items = db.prepare('SELECT * FROM wishlist WHERE targetPrice IS NOT NULL AND targetPrice > 0').all() as any[];
    const triggeredAlerts = [];

    for (const item of items) {
      const details = await fetchGameDetails(item.gameID);
      if (details && details.deals && details.deals.length > 0) {
        // Encontra o menor preço atual em todas as lojas
        const bestDeal = details.deals.reduce((min, d) => 
          parseFloat(d.price) < parseFloat(min.price) ? d : min, details.deals[0]
        );
        const currentPrice = parseFloat(bestDeal.price);

        // Atualizar preço atual no banco
        db.prepare('UPDATE wishlist SET currentBestPrice = ? WHERE gameID = ?').run(currentPrice, item.gameID);

        // Se o preço atingiu ou ficou abaixo da meta
        if (currentPrice <= item.targetPrice) {
          triggeredAlerts.push({
            gameID: item.gameID,
            title: item.title,
            targetPrice: item.targetPrice,
            currentPrice,
            email: item.email,
            dealID: bestDeal.dealID,
            storeID: bestDeal.storeID
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      checkedCount: items.length,
      triggeredCount: triggeredAlerts.length,
      alerts: triggeredAlerts
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
