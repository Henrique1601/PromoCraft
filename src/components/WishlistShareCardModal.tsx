'use client';

import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Share2, Copy, Check, Download, X, Sparkles, Flame, DollarSign, ExternalLink, Loader2 } from 'lucide-react';
import { sound } from '@/lib/sound';

interface WishlistShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  totalCurrentBRL: number;
  totalSavingsBRL: number;
  savingsPercent: number;
  rate?: number;
}

export function WishlistShareCardModal({
  isOpen,
  onClose,
  items,
  totalCurrentBRL,
  totalSavingsBRL,
  savingsPercent,
  rate = 5.75,
}: WishlistShareCardModalProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  async function generateShareableLink() {
    sound.playClick();
    setGeneratingLink(true);
    try {
      const res = await fetch('/api/sync/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist: items }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.code) {
        const fullUrl = `${window.location.origin}/w/${data.code}`;
        setShareUrl(fullUrl);
        navigator.clipboard.writeText(fullUrl);
        setCopiedLink(true);
        sound.playSuccess();
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch {} finally {
      setGeneratingLink(false);
    }
  }

  function handleCopyText() {
    sound.playClick();
    const top3 = items.slice(0, 3).map((i) => `• ${i.title}`).join('\n');
    const msg = `🎮 Minha Wishlist no PromoCraft!\n\n` +
      `🔥 Monitorando ${items.length} jogos\n` +
      `💰 Economia estimada: R$ ${totalSavingsBRL.toFixed(2).replace('.', ',')} (-${savingsPercent}%)\n` +
      `🏷️ Total no menor preço: R$ ${totalCurrentBRL.toFixed(2).replace('.', ',')}\n\n` +
      (top3 ? `Destaques:\n${top3}\n\n` : '') +
      `Confira e compare preços em 30+ lojas oficiais: ${shareUrl || 'https://promocraft.netlify.app'}`;

    navigator.clipboard.writeText(msg);
    setCopiedText(true);
    sound.playSuccess();
    setTimeout(() => setCopiedText(false), 2500);
  }

  const content = (
    <div className="fixed inset-0 z-[120] flex min-h-screen items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" />

      <div className="relative my-auto w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl z-10 space-y-4">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 pr-8">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400">
            <Share2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white">
              Card Gamer & Compartilhamento
            </h3>
            <p className="text-xs text-zinc-400">
              Compartilhe sua lista de desejos e o total economizado com amigos.
            </p>
          </div>
        </div>

        {/* Card Gamer Preview (Estilo Wrapped / Stories) */}
        <div
          ref={cardRef}
          className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-5 shadow-2xl space-y-4 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo Marca d'água */}
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <img src="/logo-mark.png" alt="PromoCraft" className="h-6 w-6 rounded-lg object-cover" />
              <span className="text-xs font-black tracking-tight text-white">
                Promo<span className="text-emerald-400">Craft</span>
              </span>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Gamer Wrapped • Wishlist
            </span>
          </div>

          {/* Métricas Principais */}
          <div className="py-2 space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
              <Flame className="h-4 w-4 fill-current" />
              <span>Economia Acumulada</span>
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              R$ {totalSavingsBRL.toFixed(2).replace('.', ',')}
            </div>
            <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-black text-emerald-300">
              Desconto Médio de {savingsPercent}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-zinc-800/60">
            <div className="rounded-xl bg-zinc-900/60 p-2.5">
              <span className="text-zinc-500 block text-[10px]">Jogos Monitorados</span>
              <span className="font-extrabold text-white text-base">{items.length} títulos</span>
            </div>
            <div className="rounded-xl bg-zinc-900/60 p-2.5">
              <span className="text-zinc-500 block text-[10px]">Total Menor Preço Hoje</span>
              <span className="font-extrabold text-emerald-400 text-base">
                R$ {totalCurrentBRL.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Amostra dos 3 primeiros jogos com capas */}
          {items.length > 0 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              {items.slice(0, 4).map((game: any, idx: number) => (
                <div key={idx} className="h-10 w-16 rounded-lg overflow-hidden border border-zinc-800 shadow">
                  <img src={game.thumb} alt={game.title} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="space-y-2 pt-1">
          <button
            onClick={generateShareableLink}
            disabled={generatingLink}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-extrabold text-zinc-950 transition hover:opacity-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
          >
            {generatingLink ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : copiedLink ? (
              <Check className="h-4 w-4 text-zinc-950" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span>
              {generatingLink
                ? 'Criando Link Público...'
                : copiedLink
                ? 'Link Público Copiado!'
                : shareUrl
                ? 'Copiar Link Público Novamente'
                : 'Gerar Link Público Compartilhável'}
            </span>
          </button>

          {shareUrl && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-center text-xs text-emerald-300 font-mono truncate">
              {shareUrl}
            </div>
          )}

          <button
            onClick={handleCopyText}
            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/80 py-2.5 text-xs font-bold text-zinc-200 hover:border-emerald-500 hover:text-white transition"
          >
            {copiedText ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copiedText ? 'Texto Copiado para Área de Transferência!' : 'Copiar Resumo em Texto (WhatsApp/Discord)'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
