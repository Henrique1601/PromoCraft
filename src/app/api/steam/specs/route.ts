import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get('appId');

    if (!appId || !/^\d+$/.test(appId)) {
      return NextResponse.json({ error: 'appId numérico é obrigatório' }, { status: 400 });
    }

    const steamUrl = `https://store.steampowered.com/api/appdetails?appids=${appId}&cc=br&l=brazilian`;

    const res = await fetch(steamUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 }, // Cache de 24 horas por jogo
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Falha ao consultar Steam Store' }, { status: 502 });
    }

    const data = await res.json();
    const appData = data[appId];

    if (!appData || !appData.success || !appData.data) {
      return NextResponse.json({ success: false, error: 'Dados do jogo não encontrados na Steam' }, { status: 404 });
    }

    const game = appData.data;
    const pcRequirements = game.pc_requirements || {};

    return NextResponse.json({
      success: true,
      appId,
      name: game.name,
      minimum: pcRequirements.minimum || null,
      recommended: pcRequirements.recommended || null,
      developers: game.developers || [],
      publishers: game.publishers || [],
      genres: (game.genres || []).map((g: any) => g.description),
      releaseDate: game.release_date?.date || null,
    });
  } catch (error: any) {
    console.error('Erro na rota /api/steam/specs:', error);
    return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 });
  }
}
