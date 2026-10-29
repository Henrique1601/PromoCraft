'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Trash2, ExternalLink, Heart, Bell, RefreshCw, Gamepad2 } from 'lucide-react';

interface WishlistItem {
  id: string;
  gameID: string;
  title: string;
  thumb?: string;
  steamAppID?: string;
  cheapestPriceEver?: number;
  currentBestPrice?: number;
  targetPrice?: number;
  email?: string;
  createdAt: string;
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [alertSummary, setAlertSummary] = useState<string | null>(null);

  const USD_TO_BRL = 5.75;

  async function loadWishlist() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  async function removeItem(gameID: string) {
    try {
      const res = await fetch(`/api/wishlist?gameID=${encodeURIComponent(gameID)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.gameID !== gameID));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function checkPricesNow() {
    setCheckingAlerts(true);
    setAlertSummary(null);
    try {
      const res = await fetch('/api/alerts/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAlertSummary(
          `Verificação concluída: ${data.checkedCount} jogos analisados, ${data.triggeredCount} ofertas dentro da sua meta de preço!`
        );
        loadWishlist();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAlerts(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Feed Geral</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={checkPricesNow}
              disabled={checkingAlerts || items.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checkingAlerts ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{checkingAlerts ? 'Verificando Lojas...' : 'Checar Preços Agora'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Heart className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
              <span>Minha Lista de Desejos & Alertas</span>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Jogos salvos com monitoramento contínuo de preços e metas de compra.
            </p>
          </div>
          <span className="text-xs text-zinc-400">
            {items.length} {items.length === 1 ? 'jogo monitorado' : 'jogos monitorados'}
          </span>
        </div>

        {alertSummary && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs font-medium text-emerald-300">
            {alertSummary}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-12 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-3 text-base font-semibold text-zinc-200">Sua wishlist está vazia</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Vá ao feed principal ou na página de detalhes de qualquer jogo e clique em "Monitorar Preço".
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              Explorar Ofertas
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-4">
            {items.map((item) => {
              const currentBRL = item.currentBestPrice
                ? (item.currentBestPrice * USD_TO_BRL).toFixed(2).replace('.', ',')
                : null;
              const targetBRL = item.targetPrice
                ? (item.targetPrice * USD_TO_BRL).toFixed(2).replace('.', ',')
                : null;
              const isTargetReached =
                item.targetPrice && item.currentBestPrice && item.currentBestPrice <= item.targetPrice;

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-4 transition md:flex-row md:items-center md:justify-between"
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
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                        {currentBRL && (
                          <span>
                            Melhor Preço Atual: <b className="text-emerald-400">R$ {currentBRL}</b>
                          </span>
                        )}
                        {targetBRL && (
                          <span className="flex items-center gap-1">
                            <Bell className="h-3 w-3 text-emerald-400" />
                            Meta de Preço: <b>R$ {targetBRL}</b>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t border-zinc-800/60 pt-3 md:border-0 md:pt-0">
                    {isTargetReached && (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/40 animate-pulse">
                        🎯 Meta Atingida!
                      </span>
                    )}

                    <Link
                      href={`/game/${item.gameID}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
                    >
                      <span>Ver Lojas</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <button
                      onClick={() => removeItem(item.gameID)}
                      title="Remover da lista"
                      className="rounded-lg p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
