'use client';

import React, { useState } from 'react';
import { Gamepad2, X, Download, Check, AlertCircle, Loader2 } from 'lucide-react';

interface SteamWishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SteamWishlistModal({ isOpen, onClose, onSuccess }: SteamWishlistModalProps) {
  const [steamInput, setSteamInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    importedCount?: number;
    foundOnSteam?: number;
    importedGames?: string[];
    error?: string;
  } | null>(null);

  if (!isOpen) return null;

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

      if (res.ok) {
        setResult(data);
        if (onSuccess) onSuccess();
      } else {
        setResult({ error: data.error || 'Falha ao sincronizar lista de desejos do Steam.' });
      }
    } catch (err: any) {
      setResult({ error: 'Erro de conexão com o servidor. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 shadow-2xl z-10">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-white">
              Sincronizar Wishlist do Steam
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Importe seus jogos desejados e descubra quais estão no menor preço em 30+ lojas.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleImport} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Seu Perfil Steam (Link, Vanity ID ou SteamID64)
            </label>
            <input
              type="text"
              placeholder="Ex: https://steamcommunity.com/id/seu_usuario ou seu_usuario"
              value={steamInput}
              onChange={(e) => setSteamInput(e.target.value)}
              disabled={loading}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition disabled:opacity-50"
            />
            <p className="mt-1.5 text-[11px] text-zinc-500">
              * Sua lista de desejos do Steam precisa estar configurada como <b>Pública</b> nas opções de privacidade do seu perfil.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !steamInput.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3 text-sm font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="mt-5">
            {result.error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/20 p-4 text-xs text-red-300">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Erro na importação</span>
                  <span>{result.error}</span>
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
                  <div className="mt-2 max-h-32 overflow-y-auto space-y-1 pr-1 text-[11px] text-zinc-400 border-t border-emerald-500/20 pt-2">
                    {result.importedGames.map((game, idx) => (
                      <div key={idx} className="truncate">• {game}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
