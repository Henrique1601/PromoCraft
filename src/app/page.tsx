import { fetchDeals, fetchStores } from '@/lib/cheapshark';
import { DealsFeed } from '@/components/DealsFeed';
import { Gamepad2, Sparkles, Tag, ShieldCheck } from 'lucide-react';

export default async function HomePage() {
  const [initialDeals, stores] = await Promise.all([
    fetchDeals({ pageSize: 32, sortBy: 'Deal Rating' }),
    fetchStores(),
  ]);

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-md shadow-emerald-950/50">
              <Gamepad2 className="h-5 w-5 text-zinc-950" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-zinc-100">
                Promo<span className="text-emerald-400">Craft</span>
              </span>
              <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                PC Deals
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="hidden sm:flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Chaves 100% Oficiais e Autorizadas</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 bg-gradient-to-b from-zinc-900/60 to-zinc-950 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mais de 30 lojas monitoradas 24h por dia</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-4xl text-zinc-100">
            Os melhores preços de jogos para PC em um só lugar.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-400">
            Compare ofertas em tempo real entre Steam, Green Man Gaming, Nuuvem, Epic Games, GOG e Fanatical. Economize até 90% em ativações oficiais.
          </p>
        </div>
      </section>

      {/* Main Content Feed */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DealsFeed initialDeals={initialDeals} stores={stores} />
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-zinc-900 bg-zinc-950/80 px-4 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 PromoCraft. Preços e disponibilidade fornecidos via agregadores oficiais.</p>
        <p className="mt-1">Todas as marcas, títulos de jogos e imagens são marcas registradas de seus respectivos proprietários.</p>
      </footer>
    </div>
  );
}
