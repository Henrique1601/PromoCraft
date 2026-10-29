import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';
import { getDirectStoreUrl } from '@/lib/links';

// Endpoint para disparar as melhores ofertas no Telegram
// Requer TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID (configurados nas envs do Netlify ou passados no body)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || process.env.TELEGRAM_BOT_TOKEN;
    const chatId = body.chatId || process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        {
          error:
            'TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID são necessários. Configure nas variáveis de ambiente ou envie na requisição.',
        },
        { status: 400 }
      );
    }

    // Busca as ofertas com maior economia (descontos de 80%+ ou notas altas)
    const deals = await fetchDeals({ pageSize: 5, sortBy: 'Deal Rating' });
    const USD_TO_BRL = 5.75;

    let sentCount = 0;
    for (const deal of deals) {
      const savings = Math.round(parseFloat(deal.savings));
      const saleBRL = (parseFloat(deal.salePrice) * USD_TO_BRL).toFixed(2).replace('.', ',');
      const normalBRL = (parseFloat(deal.normalPrice) * USD_TO_BRL).toFixed(2).replace('.', ',');
      const directUrl = getDirectStoreUrl(deal.dealID, deal.storeID, deal.steamAppID, deal.title);

      const messageText = `🔥 *OFERTA IMPERDÍVEL: ${deal.title}*\n\n` +
        `📉 *Desconto:* -${savings}%\n` +
        `💰 *Preço:* R$ ${saleBRL} (De ~R$ ${normalBRL})\n` +
        `⭐ *Nota Steam:* ${deal.steamRatingPercent ? deal.steamRatingPercent + '%' : 'N/A'}\n\n` +
        `🔗 [Acessar Promoção na Loja Oficial](${directUrl})\n\n` +
        `_Encontrado via PromoCraft • promocraft.netlify.app_`;

      const telegramUrl = `https://api.telegram.org/bot${token}/sendPhoto`;
      const res = await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: deal.thumb,
          caption: messageText,
          parse_mode: 'Markdown',
        }),
      });

      if (res.ok) sentCount++;
    }

    return NextResponse.json({
      success: true,
      sentCount,
      totalSelected: deals.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
