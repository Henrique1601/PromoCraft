'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Trash2,
  ExternalLink,
  Heart,
  Bell,
  RefreshCw,
  Gamepad2,
  Download,
  Share2,
  Check,
  Sparkles,
  TrendingDown,
  DollarSign,
  PiggyBank,
  Flame,
  Send,
} from 'lucide-react';
import { GsapBackground } from '@/components/GsapBackground';
import { useToast } from '@/components/ToastProvider';

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
  discordWebhook?: string;
  telegramChatId?: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'promocraft_wishlist_v1';

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingAlerts, setCheckingAlerts] = useState(false);
  const [alertSummary, setAlertSummary] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Steam Import Modal / Input
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [steamInput, setSteamInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const { success, error, info } = useToast();
  const USD_TO_BRL = 5.75;

  // Carregar lista de forma híbrida (localStorage primeiro, depois sync com API)
  async function loadWishlist() {
    let localList: WishlistItem[] = [];
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        localList = JSON.parse(raw);
        if (Array.isArray(localList) && localList.length > 0) {
          setItems(localList);
          setIsLoading(false);
        }
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage:', e);
    }

    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const apiData: WishlistItem[] = await res.json();
        if (Array.isArray(apiData)) {
          // Mesclar preservando itens locais únicos
          const gameIdSet = new Set(apiData.map((i) => i.gameID));
          const localOnly = localList.filter((i) => !gameIdSet.has(i.gameID));
          const merged = [...apiData, ...localOnly];
          setItems(merged);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        }
      }
    } catch (e) {
      console.warn('API de banco indisponível, usando dados locais offline.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadWishlist();

    const handleSync = () => {
      loadWishlist();
    };

    window.addEventListener('wishlist-updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('wishlist-updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  async function removeItem(gameID: string, title?: string) {
    const updated = items.filter((i) => i.gameID !== gameID);
    setItems(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      success(`"${title || 'Jogo'}" removido da sua lista de desejos.`);
    } catch (e) {
      // ignore
    }

    try {
      await fetch(`/api/wishlist?gameID=${encodeURIComponent(gameID)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.warn('Erro ao deletar da API:', e);
    }
  }

  async function checkPricesNow() {
    setCheckingAlerts(true);
    setAlertSummary(null);
    try {
      const res = await fetch('/api/alerts/check', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const msg = `Verificação concluída: ${data.checkedCount} jogos analisados, ${data.triggeredCount} ofertas dentro da meta!`;
        setAlertSummary(msg);
        info(msg);
        loadWishlist();
      }
    } catch (e) {
      error('Falha ao verificar preços dos servidores.');
    } finally {
      setCheckingAlerts(false);
    }
  }

  async function handleImportSteam() {
    if (!steamInput.trim()) return;
    setIsImporting(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/wishlist/import-steam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamInput: steamInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.importedCount > 0 && Array.isArray(data.importedGames)) {
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            const existing = raw ? JSON.parse(raw) : [];
            const existingIds = new Set(existing.map((i: any) => i.gameID));
            const newItems = data.importedGames
              .filter((g: any) => typeof g === 'object' && g.gameID && !existingIds.has(g.gameID))
              .map((g: any) => ({
                id: g.id || `local_${Date.now()}_${g.gameID}`,
                gameID: g.gameID,
                title: g.title,
                thumb: g.thumb,
                steamAppID: g.steamAppID,
                currentBestPrice: g.currentBestPrice || g.salePrice,
                cheapestPriceEver: g.cheapestPriceEver || null,
                createdAt: g.createdAt || new Date().toISOString(),
              }));

            const merged = [...newItems, ...existing];
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            setItems(merged);
            window.dispatchEvent(new Event('wishlist-updated'));
          } catch (e) {
            console.warn('Erro ao atualizar localStorage após importação:', e);
          }

          success(`${data.importedCount} jogos foram importados da Steam com sucesso!`);
          setImportStatus(`Sucesso! ${data.importedCount} jogos foram importados e sincronizados.`);
          loadWishlist();
        } else {
          const msg = data.message || 'Nenhum jogo público encontrado na lista Steam.';
          setImportStatus(msg);
          error(msg);
        }
      } else {
        setImportStatus(`Aviso: ${data.error || 'Não foi possível importar a lista de desejos'}`);
      }
    } catch (err: any) {
      setImportStatus('Erro de conexão ao tentar importar do Steam.');
      error('Erro de conexão ao sincronizar com a Steam.');
    } finally {
      setIsImporting(false);
    }
  }

  async function handleShareWishlist() {
    const totalCurrent = items.reduce((acc, i) => acc + (i.currentBestPrice || 0) * USD_TO_BRL, 0);
    const shareText = `🎮 Minha Wishlist no PromoCraft possui ${items.length} jogos monitorados com melhor preço somando R$ ${totalCurrent.toFixed(2).replace('.', ',')}! Confira as melhores ofertas:`;
    const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://promocraft.netlify.app/wishlist';

    if (navigator?.share) {
      try {
        await navigator.share({
          title: 'Minha Wishlist no PromoCraft',
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fallback para cópia
      }
    }

    if (navigator?.clipboard) {
      navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      setShareCopied(true);
      success('Link e resumo da Wishlist copiados para a área de transferência!');
      setTimeout(() => setShareCopied(false), 2500);
    }
  }

  // Métricas do Dashboard de Inteligência Financeira Gamer (Frente 4)
  const totalCurrentPriceBRL = items.reduce((acc, i) => acc + (i.currentBestPrice || 0) * USD_TO_BRL, 0);
  const estimatedFullPriceBRL = items.reduce((acc, i) => {
    const base = i.currentBestPrice ? i.currentBestPrice * 1.85 : 0;
    return acc + base * USD_TO_BRL;
  }, 0);
  const totalSavingsBRL = Math.max(0, estimatedFullPriceBRL - totalCurrentPriceBRL);
  const savingsPercent = estimatedFullPriceBRL > 0 ? Math.round((totalSavingsBRL / estimatedFullPriceBRL) * 100) : 0;

  return (
    <div className="relative min-h-screen">
      {/* Fundo Animado com GSAP: Orbes de Luz Atmosféricos */}
      <GsapBackground />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-sm font-medium text-zinc-400 transition hover:text-emerald-400"
          >
            <img
              src="/logo-mark.png"
              alt="PromoCraft"
              className="h-8 w-8 rounded-xl border border-emerald-500/30 object-cover shadow-sm"
            />
            <div className="flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
              <span>Voltar ao Feed Geral</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWishlist}
              disabled={items.length === 0}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
                shareCopied
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-500 font-bold shadow-md shadow-emerald-500/25'
                  : 'border-zinc-700 bg-zinc-900/90 text-zinc-200 hover:border-emerald-500 hover:text-emerald-400'
              }`}
            >
              {shareCopied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Resumo Copiado!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Compartilhar Lista</span>
                  <span className="sm:hidden">Compartilhar</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300 transition hover:border-indigo-400 hover:bg-indigo-500/20 active:scale-[0.98]"
            >
              <Download className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Importar do Steam</span>
              <span className="sm:hidden">Importar</span>
            </button>

            <button
              onClick={checkPricesNow}
              disabled={checkingAlerts || items.length === 0}
              className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-400 disabled:opacity-50 active:scale-[0.98]"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${checkingAlerts ? 'animate-spin text-emerald-400' : ''}`} />
              <span>{checkingAlerts ? 'Verificando...' : 'Checar Preços'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {/* Title */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Heart className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
              <span>Minha Lista de Desejos & Alertas</span>
            </h1>
            <p className="mt-1 text-xs text-zinc-400">
              Jogos salvos com monitoramento contínuo de preços, metas e alertas via Discord e E-mail.
            </p>
          </div>
          <span className="rounded-full bg-zinc-900/90 border border-zinc-800 px-3 py-1 text-xs font-bold text-emerald-400">
            {items.length} {items.length === 1 ? 'jogo monitorado' : 'jogos monitorados'}
          </span>
        </div>

        {/* Dashboard de Inteligência Financeira Gamer (Frente 4) */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Menor Preço Atual */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md shadow-lg flex items-center gap-3.5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Total no Menor Preço Hoje
                </span>
                <span className="text-xl font-black text-white mt-0.5 block">
                  R$ {totalCurrentPriceBRL.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Card 2: Preço Cheio Estimado */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-4 backdrop-blur-md shadow-lg flex items-center gap-3.5">
              <div className="rounded-xl border border-zinc-700 bg-zinc-800/60 p-3 text-zinc-400">
                <PiggyBank className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Preço de Tabela Cheio
                </span>
                <span className="text-xl font-bold text-zinc-400 mt-0.5 block line-through">
                  R$ {estimatedFullPriceBRL.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Card 3: Economia Acumulada */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-md shadow-lg flex items-center gap-3.5">
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-emerald-300">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <span>Você Economiza</span>
                  <span className="rounded bg-emerald-500/20 px-1 text-[10px]">-{savingsPercent}%</span>
                </span>
                <span className="text-xl font-black text-emerald-400 mt-0.5 block">
                  R$ {totalSavingsBRL.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Importação Steam */}
        {isImportOpen && (
          <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/80 p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-zinc-100">Importar Lista de Desejos do Steam</h3>
              </div>
              <button
                onClick={() => setIsImportOpen(false)}
                className="text-xs text-zinc-400 hover:text-zinc-200 transition"
              >
                Fechar
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-400">
              Digite seu ID da Steam, perfil customizado (ex: <i>gaben</i>) ou o link completo do seu perfil.
              A lista de desejos precisa estar como <b>Pública</b> nas opções de privacidade da Steam.
            </p>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Ex: seu-id-steam ou https://steamcommunity.com/id/seu-nome/"
                value={steamInput}
                onChange={(e) => setSteamInput(e.target.value)}
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={handleImportSteam}
                disabled={isImporting || !steamInput.trim()}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-xs font-bold text-white transition hover:opacity-95 disabled:opacity-50 shadow-md"
              >
                {isImporting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>{isImporting ? 'Importando...' : 'Iniciar Importação'}</span>
              </button>
            </div>

            {importStatus && (
              <div className="mt-3 rounded-lg border border-zinc-700 bg-zinc-950/80 p-3 text-xs text-zinc-300">
                {importStatus}
              </div>
            )}
          </div>
        )}

        {alertSummary && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs font-medium text-emerald-300">
            {alertSummary}
          </div>
        )}

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-12 text-center backdrop-blur-md shadow-xl">
            <Gamepad2 className="mx-auto h-12 w-12 text-zinc-600" />
            <h3 className="mt-3 text-base font-semibold text-zinc-200">Sua wishlist está vazia</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Importe sua lista do Steam ou navegue pelo feed principal e clique em "Monitorar Preço".
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsImportOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500/20"
              >
                <Download className="h-3.5 w-3.5 text-indigo-400" />
                <span>Importar do Steam</span>
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 transition hover:bg-emerald-400 shadow-md"
              >
                Explorar Ofertas
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
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
                  className="flex flex-col gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 transition md:flex-row md:items-center md:justify-between shadow-lg backdrop-blur-sm hover:border-emerald-500/30"
                >
                  <div className="flex items-center gap-4">
                    {item.thumb ? (
                      <img
                        src={item.thumb}
                        alt={item.title}
                        className="h-16 w-28 rounded-xl object-cover border border-zinc-800 shadow-md"
                      />
                    ) : (
                      <div className="flex h-16 w-28 items-center justify-center rounded-xl bg-zinc-950 border border-zinc-800">
                        <Gamepad2 className="h-6 w-6 text-zinc-600" />
                      </div>
                    )}

                    <div>
                      <Link
                        href={`/game/${item.gameID}`}
                        className="text-base font-bold text-zinc-100 hover:text-emerald-400 transition"
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
                        {item.discordWebhook && (
                          <span className="rounded-lg bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 border border-indigo-500/20">
                            Discord Ativo
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
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700 hover:text-white"
                    >
                      <span>Ver Lojas</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>

                    <button
                      onClick={() => removeItem(item.gameID, item.title)}
                      title="Remover da lista"
                      className="rounded-xl p-2 text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
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
