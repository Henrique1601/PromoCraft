import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Heart, ExternalLink, Gamepad2, Sparkles, ShieldCheck, Download, ArrowLeft } from 'lucide-react';
import { getDb } from '@/lib/db';
import { formatBRL, getUSDtoBRLRate } from '@/lib/currency';

interface SharedWishlistPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: SharedWishlistPageProps): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Wishlist Gamer Compartilhada (#${code.toUpperCase()}) | PromoCraft`,
    description: `Confira os jogos desejados e compare os menores preços históricos em 30+ lojas oficiais no PromoCraft.`,
    openGraph: {
      title: `Wishlist Gamer Compartilhada (#${code.toUpperCase()}) | PromoCraft`,
      description: `Lista de jogos desejados com comparativo de preços e descontos em tempo real.`,
    },
  };
}

export default async function SharedWishlistPage({ params }: SharedWishlistPageProps) {
  const { code } = await params;
  const cleanCode = code.trim().toUpperCase();

  let rawData: string | null = null;
  const now = Date.now();

  try {
    const db = getDb();
    const row = db.prepare('SELECT data, expiresAt FROM sync_sessions WHERE code = ?').get(cleanCode) as any;
    if (row && row.expiresAt > now) {
      rawData = row.data;
    }
  } catch {}

  if (!rawData) {
    notFound();
  }

  const items = JSON.parse(rawData);
  const rate = await getUSDtoBRLRate();

  const totalCurrentBRL = items.reduce((acc: number, i: any) => {
    return acc + (i.currentBestPrice || 0) * rate;
  }, 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition">
            <img
              src="/logo-mark.png"
              alt="PromoCraft"
              className="h-8 w-8 rounded-xl border border-emerald-500/30 object-cover shadow-sm"
            />
            <span className="text-base font-black text-white">
              Promo<span className="text-emerald-400">Craft</span>
            </span>
          </Link>

          <Link
            href="/wishlist"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-md shadow-emerald-950/40"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Criar Minha Própria Wishlist</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 flex-1 space-y-6 w-full">
        {/* Banner do Compartilhamento */}
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-zinc-900/60 to-zinc-950/80 p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-bold text-emerald-400">
              <Sparkles className="h-3 w-3" />
              <span>Lista de Desejos Compartilhada • #{cleanCode}</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Wishlist Gamer
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400">
              Esta lista contém <b>{items.length}</b> {items.length === 1 ? 'jogo desejado' : 'jogos desejados'} com preço total somando{' '}
              <b className="text-emerald-400">R$ {totalCurrentBRL.toFixed(2).replace('.', ',')}</b> no menor valor atual.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:border-emerald-500 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Explorar Ofertas</span>
            </Link>
          </div>
        </div>

        {/* Lista de Jogos */}
        <div className="grid grid-cols-1 gap-3.5">
          {items.map((item: any, idx: number) => {
            const priceBRL = item.currentBestPrice
              ? formatBRL(item.currentBestPrice, rate)
              : null;

            return (
              <div
                key={item.id || idx}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 transition hover:border-emerald-500/40 shadow-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 shadow-md">
                    {item.thumb ? (
                      <img src={item.thumb} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600">
                        <Gamepad2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-zinc-100">{item.title}</h3>
                    <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                      {priceBRL ? (
                        <span>
                          Melhor Oferta Hoje: <b className="text-emerald-400">R$ {priceBRL}</b>
                        </span>
                      ) : (
                        <span className="text-zinc-500">Preço em consulta</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-zinc-800/60 pt-3 sm:border-0 sm:pt-0">
                  <Link
                    href={`/game/${item.gameID}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition shadow-sm"
                  >
                    <span>Comparar Lojas</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 text-center text-xs text-zinc-600">
        <p>PromoCraft • Comparador em Tempo Real de Jogos de PC</p>
      </footer>
    </div>
  );
}
