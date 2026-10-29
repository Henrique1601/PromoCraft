import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Flame, History, ShieldCheck, Tag, Gamepad2 } from 'lucide-react';
import { fetchGameDetails, fetchStores } from '@/lib/cheapshark';
import { WishlistButton } from '@/components/WishlistButton';

interface GamePageProps {
  params: Promise<{ id: string }>;
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { id } = await params;
  const [game, stores] = await Promise.all([
    fetchGameDetails(id),
    fetchStores(),
  ]);

  if (!game || !game.info) {
    notFound();
  }

  const storeMap = new Map();
  stores.forEach((s) => storeMap.set(s.storeID, s));

  const USD_TO_BRL = 5.75;
  const cheapestEverUSD = parseFloat(game.cheapestPriceEver.price);
  const cheapestEverBRL = (cheapestEverUSD * USD_TO_BRL).toFixed(2).replace('.', ',');
  const cheapestEverDate = new Date(game.cheapestPriceEver.date * 1000).toLocaleDateString('pt-BR');

  // Ordenar ofertas por menor preço
  const sortedDeals = [...game.deals].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  const bestCurrentPrice = sortedDeals[0]?.price || '0';

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para as Ofertas</span>
          </Link>

          <Link href="/wishlist" className="text-xs font-semibold text-emerald-400 hover:underline">
            Minha Wishlist
          </Link>
        </div>
      </header>

      {/* Main Details */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Game Header */}
        <div className="flex flex-col gap-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 backdrop-blur-md md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={game.info.thumb}
              alt={game.info.title}
              className="h-28 w-auto rounded-xl border border-zinc-800 object-cover shadow-lg"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Comparativo de Preços
              </span>
              <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-zinc-100">
                {game.info.title}
              </h1>
              {game.info.steamAppID && (
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-400">
                  <Gamepad2 className="h-4 w-4" />
                  <span>Steam App ID: {game.info.steamAppID}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <WishlistButton
              gameID={id}
              title={game.info.title}
              thumb={game.info.thumb}
              steamAppID={game.info.steamAppID}
              cheapestPriceEver={cheapestEverUSD.toString()}
              currentBestPrice={bestCurrentPrice}
            />
          </div>
        </div>

        {/* Historical Low Card */}
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-sm text-emerald-300">
          <History className="h-5 w-5 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="font-semibold">Menor Preço Histórico Registrado: </span>
            <span className="font-bold text-white">
              R$ {cheapestEverBRL} (${cheapestEverUSD.toFixed(2)})
            </span>{' '}
            em {cheapestEverDate}.
          </div>
        </div>

        {/* Store Comparison Table */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <span>Preço Atual em Todas as Lojas Oficiais</span>
            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
              {sortedDeals.length} lojas encontradas
            </span>
          </h2>

          <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-xs font-semibold text-zinc-400">
                <tr>
                  <th className="px-4 py-3 sm:px-6">Loja</th>
                  <th className="px-4 py-3">Desconto</th>
                  <th className="px-4 py-3">Preço Regular</th>
                  <th className="px-4 py-3">Preço Atual</th>
                  <th className="px-4 py-3 sm:px-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {sortedDeals.map((deal, index) => {
                  const store = storeMap.get(deal.storeID);
                  const priceUSD = parseFloat(deal.price);
                  const retailUSD = parseFloat(deal.retailPrice);
                  const savings = Math.round(parseFloat(deal.savings));
                  const isBestDeal = index === 0;

                  const priceBRL = (priceUSD * USD_TO_BRL).toFixed(2).replace('.', ',');
                  const retailBRL = (retailUSD * USD_TO_BRL).toFixed(2).replace('.', ',');

                  const storeIconUrl = store?.images.icon
                    ? `https://www.cheapshark.com${store.images.icon}`
                    : null;
                  const dealUrl = `https://www.cheapshark.com/redirect?dealID=${encodeURIComponent(
                    deal.dealID
                  )}`;

                  return (
                    <tr
                      key={deal.dealID}
                      className={`transition ${
                        isBestDeal
                          ? 'bg-emerald-950/20 font-medium'
                          : 'hover:bg-zinc-800/40'
                      }`}
                    >
                      <td className="px-4 py-3.5 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          {storeIconUrl && (
                            <img
                              src={storeIconUrl}
                              alt={store?.storeName || 'Loja'}
                              className="h-4 w-4 object-contain"
                            />
                          )}
                          <span className="text-zinc-100 font-medium">
                            {store?.storeName || `Loja #${deal.storeID}`}
                          </span>
                          {isBestDeal && (
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                              Melhor Preço
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        {savings > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-xs font-bold text-emerald-400">
                            -{savings}%
                          </span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-zinc-500">
                        {savings > 0 ? `R$ ${retailBRL}` : '-'}
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex flex-col">
                          <span className={`text-base font-bold ${isBestDeal ? 'text-emerald-400' : 'text-zinc-100'}`}>
                            R$ {priceBRL}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            ${priceUSD.toFixed(2)} USD
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 sm:px-6 text-right">
                        <a
                          href={dealUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            isBestDeal
                              ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold shadow-md shadow-emerald-950/50'
                              : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                          }`}
                        >
                          <span>Ir à Loja</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
