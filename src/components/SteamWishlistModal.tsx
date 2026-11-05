'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Gamepad2, X, Download, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SteamWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LOCAL_STORAGE_KEY = 'promocraft_wishlist_v1';

export function SteamWishlistModal({ isOpen, onClose, onSuccess }: SteamWishlistModalProps) {
  const [steamInput, setSteamInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    importedCount?: number;
    foundOnSteam?: number;
    importedGames?: Array<{
      id: string;
      gameID: string;
      title: string;
      thumb?: string;
      steamAppID?: string;
      currentBestPrice?: number | null;
    }> | string[];
    message?: string;
    error?: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Previne scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Fechar com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!steamInput.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/wishlist/import-steam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steamInput: steamInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Persistência no localStorage (Arquitetura Híbrida)
        if (data.importedGames && Array.isArray(data.importedGames) && data.importedGames.length > 0) {
          try {
            const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
            const existing = raw ? JSON.parse(raw) : [];
            const existingIds = new Set(existing.map((item: any) => item.gameID));

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

            if (newItems.length > 0) {
              const merged = [...newItems, ...existing];
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
            }

            // Notifica outros componentes da aplicação
            window.dispatchEvent(new Event('wishlist-updated'));
          } catch (storageErr) {
            console.warn('Falha ao gravar importação no localStorage:', storageErr);
          }
        }

        setResult(data);
        if (onSuccess) onSuccess();
      } else {
        setResult({
          error: data.error || data.message || 'Falha ao sincronizar lista de desejos do Steam.',
        });
      }
    } catch (err: any) {
      setResult({ error: 'Erro de conexão com o servidor. Tente novamente mais tarde.' });
    } finally {
      setLoading(false);
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto p-3 sm:p-4 md:p-6">
      {/* Backdrop suave com desfoque e fade */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Card do Modal - Centralizado com scroll seguro */}
      <div className="relative my-auto flex max-h-[calc(100vh-2rem)] sm:max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7 shadow-2xl z-10">
        {/* Botão Fechar no Topo Direito */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Fixo */}
        <div className="flex-shrink-0 flex items-start sm:items-center gap-3 pr-10 border-b border-zinc-800/80 pb-4">
          <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-indigo-400 shadow-sm shadow-indigo-500/20">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Sincronizar Wishlist do Steam
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Importe seus jogos desejados e descubra quais estão no menor preço em 30+ lojas.
            </p>
          </div>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 min-h-0 overflow-y-auto mt-4 pr-1 space-y-4">
          {/* Formulário */}
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Seu Perfil Steam (Link, Vanity ID ou SteamID64)
              </label>
              <input
                type="text"
                placeholder="Ex: seu_usuario ou 76561198... ou link do perfil"
                value={steamInput}
                onChange={(e) => setSteamInput(e.target.value)}
                disabled={loading}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:border-indigo-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition disabled:opacity-50"
              />
              <p className="mt-1.5 text-[11px] text-zinc-500">
                * Sua lista de desejos do Steam precisa estar configurada como <b>Pública</b> nas opções de privacidade do seu perfil.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !steamInput.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-xs sm:text-sm font-extrabold text-white transition hover:opacity-95 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Consultando Servidores Steam...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Importar Lista de Desejos</span>
                </>
              )}
            </button>
          </form>

          {/* Feedback de Resultado */}
          {result && (
            <div className="pt-2">
              {result.error ? (
                <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Erro na importação</span>
                    <span>{result.error}</span>
                  </div>
                </div>
              ) : result.foundOnSteam === 0 ? (
                <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-300">
                  <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Nenhum jogo encontrado</span>
                    <span>
                      {result.message ||
                        'Não encontramos jogos públicos nesta conta. Verifique se a sua Lista de Desejos está configurada como Pública no Steam.'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-white">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Sincronização concluída com sucesso!</span>
                  </div>
                  <p className="text-zinc-300">
                    Encontramos <b>{result.foundOnSteam}</b> jogos no Steam e adicionamos <b>{result.importedCount}</b> ofertas ativas à sua Wishlist local.
                  </p>
                  {result.importedGames && result.importedGames.length > 0 && (
                    <div className="mt-2 max-h-40 overflow-y-auto space-y-1.5 pr-1 text-[11px] text-zinc-400 border-t border-emerald-500/20 pt-2">
                      {result.importedGames.map((game: any, idx: number) => {
                        const title = typeof game === 'string' ? game : game.title;
                        return (
                          <div key={idx} className="flex items-center gap-2 truncate">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                            <span className="truncate">{title}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
