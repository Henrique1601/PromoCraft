import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchDeals, fetchStores } from '@/lib/cheapshark';
import { getUSDtoBRLRate } from '@/lib/currency';
import { GENRES_SEO_DATA, getGenreBySlug } from '@/lib/seoGenres';
import { DealsFeed } from '@/components/DealsFeed';
import { GsapBackground } from '@/components/GsapBackground';
import { HomeShell } from '@/components/HomeShell';
import { Gamepad2, ChevronRight, Tag, Flame, Sparkles } from 'lucide-react';

interface GenrePageProps {
  params: Promise<{ genre: string }>;
}

export async function generateStaticParams() {
  return Object.keys(GENRES_SEO_DATA).map((genre) => ({ genre }));
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params;
  const genreInfo = getGenreBySlug(genre);

  const title = `Promoções de Jogos de ${genreInfo.name} para PC | Menor Preço no PromoCraft`;
  const description = `${genreInfo.description} Compare preços em mais de 30 lojas digitais oficiais e economize com conversão em Reais.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://promocraft.netlify.app/genero/${genreInfo.slug}`,
      images: ['/logo.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre: genreSlug } = await params;
  const genreInfo = getGenreBySlug(genreSlug);

  const [stores, rate] = await Promise.all([
    fetchStores(),
    getUSDtoBRLRate(),
  ]);

  // Buscar ofertas relacionadas ao gênero
  const initialDeals = await fetchDeals({
    title: genreInfo.searchQuery,
    pageSize: 32,
    sortBy: 'Deal Rating',
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Promoções de Jogos de ${genreInfo.name} para PC`,
    description: genreInfo.description,
    url: `https://promocraft.netlify.app/genero/${genreInfo.slug}`,
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
          name: 'Gêneros Populares',
          item: 'https://promocraft.netlify.app/#catalogo',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: genreInfo.name,
          item: `https://promocraft.netlify.app/genero/${genreInfo.slug}`,
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
          <span>Gêneros</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="font-semibold text-emerald-400">{genreInfo.name}</span>
        </nav>

        {/* Hero Banner do Gênero */}
        <section className="relative overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/60 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Gamepad2 className="h-3.5 w-3.5" />
                  <span>{genreInfo.badge}</span>
                </span>
                <span className="rounded-full bg-zinc-800/80 border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-300">
                  {initialDeals.length}+ Títulos Filtrados
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
                <Flame className="h-8 w-8 text-amber-400" />
                <span>Jogos de {genreInfo.name}</span>
              </h1>

              <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                {genreInfo.tagline}. {genreInfo.description}
              </p>

              {/* Franquias e títulos emblemáticos do gênero */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1">
                  <Tag className="h-3 w-3 text-emerald-400" />
                  <span>Exemplos:</span>
                </span>
                {genreInfo.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-lg bg-zinc-800/70 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 border border-zinc-700/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-3 border-t md:border-t-0 md:border-l border-zinc-800/80 pt-4 md:pt-0 md:pl-8 shrink-0">
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Cotação Comercial
                </span>
                <span className="text-sm font-black text-emerald-400 mt-0.5 block">
                  1 USD = R$ {rate.toFixed(2)}
                </span>
              </div>
              <div className="text-left md:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                  Garantia de Preço
                </span>
                <span className="text-xs font-bold text-zinc-300 mt-0.5 block">
                  Menor Histórico Auditado
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Divisor do Feed */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-zinc-800/80 pt-6">
          <div>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span>Ofertas em Destaque no Gênero</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Compare em tempo real entre Steam, GOG, Epic Games, Nuuvem e parceiros oficiais.
            </p>
          </div>
        </div>

        {/* Feed de Ofertas do Gênero com Filtro de Busca Pré-Aplicado */}
        <DealsFeed
          initialDeals={initialDeals}
          stores={stores}
          rate={rate}
          initialFilters={{ search: genreInfo.searchQuery }}
        />
      </HomeShell>
    </div>
  );
}
