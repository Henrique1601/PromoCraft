import { NextRequest, NextResponse } from 'next/server';
import { fetchDeals } from '@/lib/cheapshark';
import { getUSDtoBRLRate, formatBRL } from '@/lib/currency';

interface ConciergeRecommendation {
  gameID: string;
  dealID: string;
  title: string;
  thumb: string;
  storeID: string;
  salePriceBRL: string;
  savings: number;
  steamRatingPercent?: string;
  matchScore: number;
  reason: string;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query de busca é obrigatória' }, { status: 400 });
    }

    const cleanQuery = query.toLowerCase().trim();
    const rate = await getUSDtoBRLRate();

    // Busca as melhores promoções atuais do mercado
    const deals = await fetchDeals({ pageSize: 60, sortBy: 'Deal Rating' });

    // Dicionário semântico gamer
    const genreKeywords: Record<string, string[]> = {
      rpg: ['witcher', 'fallout', 'cyberpunk', 'persona', 'elder scrolls', 'dragon', 'souls', 'final fantasy', 'baldurs'],
      soulslike: ['dark souls', 'elden ring', 'sekiro', 'lies of p', 'nioh', 'bloodborne', 'lords of the fallen'],
      terror: ['resident evil', 'silent hill', 'dead space', 'outlast', 'alien', 'amnesia', 'phasmophobia'],
      coop: ['left 4 dead', 'it takes two', 'payday', 'borderlands', 'helldivers', 'portal', 'deep rock', 'overcooked'],
      roguelike: ['hades', 'dead cells', 'isaac', 'slay the spire', 'risk of rain', 'vampire survivors', 'enter the gungeon'],
      fps: ['doom', 'battlefield', 'call of duty', 'bioshock', 'metro', 'titanfall', 'halo', 'far cry'],
      deck: ['steam deck', 'portatil', 'leve', 'indie', 'vampire survivors', 'hades', 'hollow knight', 'celeste'],
    };

    // Identificar intenção do prompt
    const isSeekingCheap = cleanQuery.includes('barato') || cleanQuery.includes('20') || cleanQuery.includes('30') || cleanQuery.includes('leve');
    const isSeekingAAA = cleanQuery.includes('aaa') || cleanQuery.includes('graficos') || cleanQuery.includes('pesado') || cleanQuery.includes('blockbuster');
    const isSeekingDeck = cleanQuery.includes('deck') || cleanQuery.includes('portatil') || cleanQuery.includes('portátil');

    // Mapeamento e Scoring dos Jogos
    const scoredDeals: ConciergeRecommendation[] = [];

    for (const deal of deals) {
      const titleLower = deal.title.toLowerCase();
      let score = parseFloat(deal.dealRating || '0') * 10;
      const savings = Math.round(parseFloat(deal.savings));
      const saleUSD = parseFloat(deal.salePrice);
      const saleBRL = formatBRL(saleUSD, rate);
      const saleBRLNum = saleUSD * rate;

      let reasons: string[] = [];

      // Checa match direto no título
      if (titleLower.includes(cleanQuery)) {
        score += 50;
        reasons.push('Corresponde diretamente ao título buscado');
      }

      // Checa categorias semânticas
      for (const [genre, keywords] of Object.entries(genreKeywords)) {
        if (cleanQuery.includes(genre)) {
          const hasKeyword = keywords.some((k) => titleLower.includes(k));
          if (hasKeyword) {
            score += 40;
            reasons.push(`Referência consagrada no gênero ${genre.toUpperCase()}`);
          }
        }
      }

      // Filtro de Preço Barato
      if (isSeekingCheap && saleBRLNum <= 30) {
        score += 25;
        reasons.push(`Super acessível por apenas R$ ${saleBRL}`);
      }

      // Alta aprovação da comunidade Steam
      const steamScore = parseInt(deal.steamRatingPercent || '0');
      if (steamScore >= 85) {
        score += 15;
        reasons.push(`${steamScore}% de aprovação da comunidade`);
      }

      // Desconto Recorde
      if (savings >= 70) {
        score += 20;
        reasons.push(`Mega desconto de -${savings}% OFF`);
      }

      if (isSeekingDeck && deal.steamAppID) {
        score += 15;
        reasons.push('Excelente compatibilidade com Steam Deck');
      }

      if (reasons.length === 0) {
        reasons.push('Excelente pontuação no algoritmo de melhor negócio do dia');
      }

      scoredDeals.push({
        gameID: deal.gameID,
        dealID: deal.dealID,
        title: deal.title,
        thumb: deal.thumb,
        storeID: deal.storeID,
        salePriceBRL: saleBRL,
        savings,
        steamRatingPercent: deal.steamRatingPercent,
        matchScore: score,
        reason: reasons.slice(0, 2).join(' • '),
      });
    }

    // Ordenar pelas recomendações com maior relevância
    scoredDeals.sort((a, b) => b.matchScore - a.matchScore);
    const topRecommendations = scoredDeals.slice(0, 5);

    return NextResponse.json({
      success: true,
      query,
      count: topRecommendations.length,
      recommendations: topRecommendations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
