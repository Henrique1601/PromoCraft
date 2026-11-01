import { fetchDeals, fetchStores } from '@/lib/cheapshark';
import { getUSDtoBRLRate } from '@/lib/currency';
import { DealsFeed } from '@/components/DealsFeed';
import Link from 'next/link';
import { Sparkles, Tag, ShieldCheck, DollarSign, Gamepad2, Percent, Bot } from 'lucide-react';

export default async function HomePage() {
  const [initialDeals, stores, rate] = await Promise.all([
    fetchDeals({ pageSize: 32, sortBy: 'Deal Rating' }),
    fetchStores(),
    getUSDtoBRLRate(),
  ]);

  return (
    <div className="min-h-screen bg-mesh-glow">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <img
              src="/logo-mark.png"
              alt="PromoCraft"
              className="h-9 w-9 rounded-xl border border-emerald-500/30 object-cover shadow-md shadow-emerald-950/40"
            />
            <div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-100">
                Promo<span className="text-emerald-400">Craft</span>
              </span>
              <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                PC Deals
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>Câmbio: <b className="text-emerald-400">R$ {rate.toFixed(2)}</b></span>
            </div>
            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3.5 py-1.5 font-semibold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400 shadow-sm"
            >
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              <span>Minha Wishlist & Alertas</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Chaves 100% Oficiais</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/60 bg-gradient-to-b from-zinc-900/40 to-zinc-950/90 px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 mb-4 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Monitoramento em tempo real de 30+ lojas oficiais</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight sm:text-5xl text-zinc-100 max-w-3xl">
            Encontre o menor preço histórico para qualquer jogo de PC.
          </h1>

          <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
            Agregação de ofertas entre Steam, Green Man Gaming, Nuuvem, Epic Games, GOG e Fanatical. Cotação em Reais, assistente de compra e alertas para Discord e Telegram.
          </p>

          {/* Quick Feature Badges */}
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300">
              <Bot className="h-3.5 w-3.5 text-emerald-400" />
              <span>Assistente de Compra Inteligente</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300">
              <Gamepad2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Selo Steam Deck & Portáteis</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-zinc-300">
              <Percent className="h-3.5 w-3.5 text-emerald-400" />
              <span>Rastreador de Cupons Oficiais</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Feed */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <DealsFeed initialDeals={initialDeals} stores={stores} rate={rate} />
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-900 bg-zinc-950 px-4 py-10 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-mark.png" alt="PromoCraft Logo" className="h-5 w-5 rounded-md object-cover" />
            <span className="font-bold text-zinc-400">PromoCraft © 2026</span>
          </div>

          <p className="text-zinc-500 text-[11px]">
            Preços e disponibilidade fornecidos via agregadores oficiais autorizados. Sem chaves de mercado cinza.
          </p>

          <div className="flex items-center gap-4 text-zinc-400">
            <Link href="/wishlist" className="hover:text-emerald-400 transition">Wishlist</Link>
            <a href="https://github.com/Henrique1601/PromoCraft" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
