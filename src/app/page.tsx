import { fetchDeals, fetchStores } from '@/lib/cheapshark';
import { getUSDtoBRLRate } from '@/lib/currency';
import { DealsFeed } from '@/components/DealsFeed';
import { HeroShowcase } from '@/components/HeroShowcase';
import { TopicsShelf } from '@/components/TopicsShelf';
import { GsapBackground } from '@/components/GsapBackground';
import { HomeClientControls } from '@/components/HomeClientControls';
import Link from 'next/link';
import { Sparkles, Tag, ShieldCheck, DollarSign, Flame, Gamepad2, ShoppingBag } from 'lucide-react';

export default async function HomePage() {
  const [initialDeals, superDeals, under30Deals, stores, rate] = await Promise.all([
    fetchDeals({ pageSize: 32, sortBy: 'Deal Rating' }),
    fetchDeals({ pageSize: 12, sortBy: 'Savings' }),
    fetchDeals({ pageSize: 12, upperPrice: 6, sortBy: 'Deal Rating' }),
    fetchStores(),
    getUSDtoBRLRate(),
  ]);

  return (
    <div className="relative min-h-screen">
      {/* Fundo Animado com GSAP: Orbes de Luz Atmosféricos e Cor Básica Profunda */}
      <GsapBackground />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-lg">
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
                PC Gaming Deals
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <div className="hidden md:flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300">
              <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
              <span>
                Câmbio: <b className="text-emerald-400">R$ {rate.toFixed(2)}</b>
              </span>
            </div>

            <Link
              href="/wishlist"
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-1.5 font-bold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400 shadow-sm"
            >
              <Tag className="h-3.5 w-3.5 text-emerald-400" />
              <span>Minha Wishlist</span>
            </Link>

            <HomeClientControls />

            <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Lojas 100% Oficiais</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Showcase */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 pb-24 lg:pb-10 space-y-10">
        {/* 1. Hero Showcase Interativo estilo Nuuvem */}
        <HeroShowcase deals={initialDeals} stores={stores} rate={rate} />

        {/* 2. Prateleira Temática: Super Ofertas & Recordes Históricos */}
        <TopicsShelf
          title="Super Ofertas & Recordes Históricos"
          subtitle="Os maiores descontos percentuais em jogos aclamados pela comunidade"
          badge="70%+ OFF"
          icon={<Flame className="h-5 w-5 fill-amber-400 text-amber-400" />}
          deals={superDeals}
          stores={stores}
          rate={rate}
        />

        {/* 3. Prateleira Temática: Baratos & Essenciais */}
        <TopicsShelf
          title="Baratos Imperdíveis (Até R$ 30)"
          subtitle="Grandes jogos com preço acessível para jogar hoje mesmo no PC ou Steam Deck"
          badge="Até R$ 30"
          icon={<Sparkles className="h-5 w-5 text-emerald-400" />}
          deals={under30Deals}
          stores={stores}
          rate={rate}
        />

        {/* 4. Divisor de Seção com Destaque de Exploração */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800/80 pt-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-emerald-400" />
              <span>Catálogo Geral de Promoções</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Filtre por lojas oficiais, faixas de preço em Reais e avaliações na barra lateral.
            </p>
          </div>
        </div>

        {/* 5. Feed com Sidebar Lateral Integrada */}
        <DealsFeed initialDeals={initialDeals} stores={stores} rate={rate} />
      </main>

      {/* Footer Gamer Elegante */}
      <footer className="mt-20 border-t border-zinc-900 bg-zinc-950/90 px-4 py-12 text-center text-xs text-zinc-500 backdrop-blur-md">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo-mark.png" alt="PromoCraft Logo" className="h-6 w-6 rounded-lg object-cover" />
            <span className="font-extrabold text-zinc-300 tracking-tight">PromoCraft © 2026</span>
          </div>

          <p className="text-zinc-500 text-[11px] max-w-md">
            Agregação de ofertas em tempo real através de parceiros oficiais autorizados. Preços e disponibilidade sujeitos a alteração pelas lojas.
          </p>

          <div className="flex items-center gap-5 text-zinc-400 font-semibold">
            <Link href="/wishlist" className="hover:text-emerald-400 transition">Wishlist</Link>
            <a
              href="https://github.com/Henrique1601/PromoCraft"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-emerald-400 transition"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
