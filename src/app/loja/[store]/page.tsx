import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchDeals, fetchStores } from '@/lib/cheapshark';
import { getUSDtoBRLRate } from '@/lib/currency';
import { STORES_SEO_DATA, getStoreBySlug } from '@/lib/seoStores';
import { DealsFeed } from '@/components/DealsFeed';
import { GsapBackground } from '@/components/GsapBackground';
import { HomeShell } from '@/components/HomeShell';
import { Store, ShieldCheck, ChevronRight, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';

interface StorePageProps {
  params: Promise<{ store: string }>;
}

export async function generateStaticParams() {
  return Object.keys(STORES_SEO_DATA).map((store) => ({ store }));
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { store } = await params;
  const storeInfo = getStoreBySlug(store);

  const title = `Promoções ${storeInfo.name} | Menor Preço e Chaves Oficiais de Jogos PC`;
  const description = `${storeInfo.description} Compare preços com Steam, Nuuvem, Epic e parceiros autorizados no PromoCraft com conversão em Reais.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://promocraft.netlify.app/loja/${storeInfo.slug}`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { store: storeSlug } = await params;
  const storeInfo = getStoreBySlug(storeSlug);

  const [stores, rate] = await Promise.all([
    fetchStores(),
    getUSDtoBRLRate(),
  ]);

  // Buscar ofertas da loja específica
  const initialDeals = await fetchDeals({
    storeID: storeInfo.storeID,
    pageSize: 32,
    sortBy: 'Deal Rating',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Promoções e Ofertas da loja ${storeInfo.name}`,
    description: storeInfo.description,
    url: `https://promocraft.netlify.app/loja/${storeInfo.slug}`,
    publisher: {
      '@type': 'Organization',
      name: 'PromoCraft',
      url: 'https://promocraft.netlify.app',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'PromoCraft',
          item: 'https://promocraft.netlify.app',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Lojas Oficiais',
          item: 'https://promocraft.netlify.app/#catalogo',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: storeInfo.name,
          item: `https://promocraft.netlify.app/loja/${storeInfo.slug}`,
        },
      ],
    },
  };

  return (
    <div className="relative min-h-screen">
      <GsapBackground />

      {/* Structured Data JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HomeShell rate={rate} stores={stores}>
        {/* Breadcrumb Gamer */}
        <nav className="flex items-center gap-2 text-xs text-zinc-400">
          <Link href="/" className="hover:text-emerald-400 transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span>Lojas Oficiais</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="font-semibold text-emerald-400">{storeInfo.name}</span>
        </nav>

        {/* Hero Banner da Loja */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{storeInfo.activationBadge}</span>
                </span>
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
                  {initialDeals.length}+ Jogos em Promoção
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <Store className="h-8 w-8 text-emerald-400" />
                <span>Ofertas {storeInfo.name}</span>
              </h1>

              <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                {storeInfo.tagline}. {storeInfo.description}
              </p>

              {/* Badges de recursos da loja */}
              <div className="flex flex-wrap gap-2 pt-2">
                {storeInfo.features.map((feat) => (
                  <span
                    key={feat}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800/60 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 border border-zinc-700/50"
                  >
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    <span>{feat}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-8 shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Status da Distribuidora
                </span>
                <span className="text-sm font-black text-emerald-400 flex items-center gap-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  100% Oficial & Autorizada
                </span>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Moeda Oficial de Comparação
                </span>
                <span className="text-xs font-bold text-zinc-200 mt-0.5 block">
                  Real Brasileiro (BRL R$)
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Divisor do Feed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800/80 pt-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-emerald-400" />
              <span>Todas as Ofertas de {storeInfo.name}</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Tabela compacta, ordenação por maior desconto e alerta de menor preço histórico.
            </p>
          </div>
        </div>

        {/* Feed de Ofertas da Loja com Filtro Pré-Aplicado */}
        <DealsFeed
          initialDeals={initialDeals}
          stores={stores}
          rate={rate}
          initialFilters={{ store: storeInfo.storeID }}
        />
      </HomeShell>
    </div>
  );
}
