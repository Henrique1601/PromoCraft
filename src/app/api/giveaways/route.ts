import { NextResponse } from 'next/server';

export interface Giveaway {
  id: number | string;
  title: string;
  worth: string;
  thumbnail: string;
  image: string;
  description: string;
  instructions: string;
  open_giveaway_url: string;
  published_date: string;
  type: string;
  platforms: string;
  end_date: string;
  status: string;
}

let cachedGiveaways: Giveaway[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos

export async function GET() {
  const now = Date.now();

  if (cachedGiveaways && now - lastFetchTime < CACHE_TTL_MS) {
    return NextResponse.json({
      giveaways: cachedGiveaways,
      cached: true,
      count: cachedGiveaways.length,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch('https://www.gamerpower.com/api/giveaways?platform=pc', {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        // Limitar aos primeiros 24 giveaways mais relevantes e ativos
        cachedGiveaways = data.slice(0, 24);
        lastFetchTime = now;

        return NextResponse.json({
          giveaways: cachedGiveaways,
          cached: false,
          count: cachedGiveaways.length,
        });
      }
    }
  } catch (error) {
    console.warn('Falha ao consultar GamerPower Giveaways API:', error);
  }

  // Fallback em caso de indisponibilidade da API externa
  const fallbackGiveaways: Giveaway[] = [
    {
      id: 1,
      title: 'Epic Games Weekly Mystery Free Game',
      worth: '$19.99',
      thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
      description: 'Jogo completo grátis disponibilizado semanalmente pela Epic Games Store.',
      instructions: 'Acesse a Epic Games Store e clique em Obter para vincular à sua conta permanentemente.',
      open_giveaway_url: 'https://store.epicgames.com/free-games',
      published_date: new Date().toISOString(),
      type: 'Game',
      platforms: 'PC, Epic Games',
      end_date: 'N/A',
      status: 'Active',
    },
    {
      id: 2,
      title: 'GOG Special Giveaway',
      worth: '$14.99',
      thumbnail: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
      description: 'Título clássico livre de DRM para resgate na plataforma GOG.com.',
      instructions: 'Role até o banner da página inicial do GOG e clique em Adicionar à Biblioteca.',
      open_giveaway_url: 'https://www.gog.com',
      published_date: new Date().toISOString(),
      type: 'Game',
      platforms: 'PC, GOG',
      end_date: 'N/A',
      status: 'Active',
    },
  ];

  return NextResponse.json({
    giveaways: cachedGiveaways || fallbackGiveaways,
    cached: false,
    count: (cachedGiveaways || fallbackGiveaways).length,
  });
}
