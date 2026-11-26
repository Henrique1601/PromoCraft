import Link from 'next/link';
import { ArrowLeft, ExternalLink, Heart, Gamepad2 } from 'lucide-react';
import { fetchGameDetails } from '@/lib/cheapshark';
import { getUSDtoBRLRate } from '@/lib/currency';

interface SharedGame {
  gameID: string;
  title: string;
  thumb?: string;
}

interface SharePageProps {
  searchParams: Promise<{ data?: string }>;
}

export default async function SharedWishlistPage({ searchParams }: SharePageProps) {
  const { data } = await searchParams;
  let sharedGames: SharedGame[] = [];

  if (data) {
    try {
      const decoded = Buffer.from(decodeURIComponent(data), 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        sharedGames = parsed.slice(0, 20);
      }
    } catch {
      sharedGames = [];
    }
  }

  const rate = await getUSDtoBRLRate();

  const enrichedGames = await Promise.all(
    sharedGames.map(async (g) => {
      const details = await fetchGameDetails(g.gameID);
      const bestDeal = details?.deals?.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))[0];
      return {
        ...g,
        thumb: details?.info?.thumb || g.thumb,
        bestPriceUSD: bestDeal ? parseFloat(bestDeal.price) : null,
      };
    })
  );

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Ir para o PromoCraft</span>
          </Link>
          <span className="text-xs font-semibold text-emerald-400">Wishlist Pública</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="border-b border-zinc-800 pb-5">
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Heart className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
            <span>Lista de Desejos Compartilhada</span>
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Preços atualizados em tempo real para você escolher o melhor presente.
          </p>
        </div>

        {enrichedGames.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-3 text-base font-semibold text-zinc-200">Lista vazia ou link inválido</h3>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              Explorar Ofertas
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {enrichedGames.map((item) => {
              const priceBRL =
                item.bestPriceUSD !== null
                  ? (item.bestPriceUSD * rate).toFixed(2).replace('.', ',')
                  : null;

              return (
                <div
                  key={item.gameID}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4"
                >
                  <div className="flex items-center gap-4">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt={item.title}
                        className="h-16 w-28 rounded-lg object-cover border border-zinc-800"
                      />
                    ) : (
                      <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-zinc-950">
                        <Gamepad2 className="h-6 w-6 text-zinc-600" />
                      </div>
                    )}
                    <div>
                      <Link
                        href={`/game/${item.gameID}`}
                        className="text-base font-semibold text-zinc-100 hover:text-emerald-400 transition"
                      >
                        {item.title}
                      </Link>
                      {priceBRL && (
                        <p className="mt-1 text-xs text-zinc-400">
                          Melhor preço hoje: <b className="text-emerald-400">R$ {priceBRL}</b>
                        </p>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/game/${item.gameID}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400"
                  >
                    <span>Ver Lojas</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
