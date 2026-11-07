import { fetchDeals, fetchStores } from '@/lib/cheapshark';
import { getUSDtoBRLRate } from '@/lib/currency';
import { DealsFeed } from '@/components/DealsFeed';
import { HeroShowcase } from '@/components/HeroShowcase';
import { TopicsShelf } from '@/components/TopicsShelf';
import { GsapBackground } from '@/components/GsapBackground';
import { HomeShell } from '@/components/HomeShell';
import Link from 'next/link';
import { Sparkles, Flame, ShoppingBag, Gift } from 'lucide-react';

export default async function HomePage() {
  const [initialDeals, superDeals, under30Deals, freeDeals, stores, rate] = await Promise.all([
    fetchDeals({ pageSize: 32, sortBy: 'Deal Rating' }),
    fetchDeals({ pageSize: 12, sortBy: 'Savings' }),
    fetchDeals({ pageSize: 12, upperPrice: 6, sortBy: 'Deal Rating' }),
    fetchDeals({ pageSize: 12, upperPrice: 0, sortBy: 'Savings' }).catch(() => []),
    fetchStores(),
    getUSDtoBRLRate(),
  ]);

  return (
    <div className="relative min-h-screen">
      {/* Fundo Animado com GSAP: Orbes de Luz Atmosféricos e Cor Básica Profunda */}
      <GsapBackground />

      {/* Shell da Aplicação: Navbar Despoluída + Sidebar para Todo o Site */}
      <HomeShell rate={rate} stores={stores}>
        {/* 1. Hero Showcase Interativo estilo Nuuvem com Imagens de Capa em Destaque */}
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

        {/* 3.5. Prateleira Temática: Jogos Grátis & Giveaways */}
        {freeDeals && freeDeals.length > 0 && (
          <TopicsShelf
            title="Jogos 100% Grátis & Giveaways"
            subtitle="Ativações oficiais gratuitas por tempo limitado para resgatar e jogar sem gastar nada"
            badge="100% OFF / GRÁTIS"
            icon={<Gift className="h-5 w-5 text-purple-400" />}
            deals={freeDeals}
            stores={stores}
            rate={rate}
          />
        )}

        {/* 4. Divisor de Seção do Catálogo de Promoções */}
        <div id="catalogo" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800/80 pt-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-emerald-400" />
              <span>Catálogo Geral de Promoções</span>
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Filtre por coleções, gêneros populares, orçamento em Reais e lojas oficiais na barra lateral esquerda.
            </p>
          </div>
        </div>

        {/* 5. Feed de Promoções Reativo conectado à Sidebar Global */}
        <DealsFeed initialDeals={initialDeals} stores={stores} rate={rate} />
      </HomeShell>

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
