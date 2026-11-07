'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Share2,
  Copy,
  Check,
  Sparkles,
  Flame,
  Download,
  ExternalLink,
} from 'lucide-react';

interface ShareableDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  thumb: string;
  priceBRL: string;
  priceUSD: string;
  savings: number;
  cheapestEverBRL?: string;
}

export function ShareableDealModal({
  isOpen,
  onClose,
  title,
  thumb,
  priceBRL,
  priceUSD,
  savings,
  cheapestEverBRL,
}: ShareableDealModalProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://promocraft.netlify.app';
  const shareText = `🔥 Olha esse desconto no PromoCraft!\n🎮 ${title}\n💸 Por apenas R$ ${priceBRL} (-${savings}% OFF)\n${cheapestEverBRL ? `👑 Recorde histórico: R$ ${cheapestEverBRL}\n` : ''}Confira agora: ${currentUrl}`;

  async function handleCopy() {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  async function handleNativeShare() {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: `Promoção: ${title} no PromoCraft`,
          text: shareText,
          url: currentUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-7 shadow-2xl text-zinc-100 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <Share2 className="h-5 w-5 text-emerald-400" />
            <h3 className="font-extrabold text-base text-white">
              Compartilhar Oferta Gamer
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-800 p-1.5 text-zinc-400 transition hover:bg-zinc-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card Visual Estilizado (Preview do Card Shareable) */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-zinc-900 via-zinc-950 to-emerald-950/40 p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="/logo-mark.png"
                alt="PromoCraft"
                className="h-6 w-6 rounded-lg border border-emerald-500/30"
              />
              <span className="text-xs font-black tracking-tight text-white">
                Promo<span className="text-emerald-400">Craft</span>
              </span>
            </div>
            {savings > 0 && (
              <span className="rounded-md bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-zinc-950">
                -{savings}% OFF
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <img
              src={thumb}
              alt={title}
              className="h-20 w-32 rounded-xl border border-zinc-800 object-cover shadow-md"
            />
            <div className="space-y-1">
              <h4 className="font-black text-white text-sm line-clamp-2 leading-snug">
                {title}
              </h4>
              <div className="text-lg font-black text-emerald-400">
                R$ {priceBRL}{' '}
                <span className="text-xs font-normal text-zinc-400">(${priceUSD} USD)</span>
              </div>
              {cheapestEverBRL && (
                <span className="text-[10px] text-amber-400 block font-semibold">
                  👑 Menor Preço Histórico: R$ {cheapestEverBRL}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={handleNativeShare}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2.5 text-xs font-bold transition shadow-md shadow-emerald-950/40 active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            <span>Compartilhar Agora</span>
          </button>

          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition active:scale-95 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
