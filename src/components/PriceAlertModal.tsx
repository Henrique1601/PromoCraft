'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check, AlertCircle, Loader2, Send, ExternalLink } from 'lucide-react';
import { Deal } from '@/types/deals';

interface PriceAlertModalProps {
  deal: Deal;
  currentPriceBRL: string;
  rate?: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PriceAlertModal({
  deal,
  currentPriceBRL,
  rate = 5.75,
  isOpen,
  onClose,
  onSuccess,
}: PriceAlertModalProps) {
  const currentPriceNum = parseFloat(deal.salePrice);
  const suggestedTargetBRL = (currentPriceNum * 0.85 * rate).toFixed(2).replace('.', ',');

  const [targetPriceBRL, setTargetPriceBRL] = useState(suggestedTargetBRL);
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);
  const [mounted, setMounted] = useState(false);

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

  async function handleSaveAlert(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const priceUSD = parseFloat(targetPriceBRL.replace(',', '.')) / rate;

    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameID: deal.gameID,
          title: deal.title,
          thumb: deal.thumb,
          steamAppID: deal.steamAppID,
          currentBestPrice: parseFloat(deal.salePrice),
          targetPrice: priceUSD,
          discordWebhook: discordWebhook.trim() || undefined,
          email: email.trim() || undefined,
        }),
      });

      if (res.ok) {
        setStatus({
          success: 'Alerta de preço salvo com sucesso! Você será notificado quando o jogo atingir sua meta.',
        });
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        setStatus({ error: data.error || 'Falha ao salvar alerta de preço.' });
      }
    } catch (err) {
      setStatus({ error: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleTestWebhook() {
    if (!discordWebhook || !discordWebhook.startsWith('https://discord.com/api/webhooks/')) {
      setStatus({
        error: 'Insira um URL válido de Webhook do Discord (começa com https://discord.com/api/webhooks/...)',
      });
      return;
    }

    setTestLoading(true);
    setStatus(null);

    try {
      const res = await fetch(discordWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'PromoCraft Alertas',
          avatar_url: 'https://promocraft.netlify.app/apple-touch-icon.png',
          embeds: [
            {
              title: `🔔 Teste de Alerta: ${deal.title}`,
              description: `Conexão bem sucedida! Este canal receberá notificações automáticas quando o preço de **${deal.title}** atingir sua meta.\n\n**Preço Atual:** R$ ${currentPriceBRL}`,
              color: 0x10b981,
              thumbnail: { url: deal.thumb },
              footer: { text: 'PromoCraft Alertas em Tempo Real' },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (res.ok) {
        setStatus({
          success: 'Mensagem de teste enviada para o seu canal do Discord com sucesso! Verifique seu servidor.',
        });
      } else {
        setStatus({ error: 'Discord recusou o webhook. Verifique se o canal e a permissão estão corretos.' });
      }
    } catch (e) {
      setStatus({ error: 'Falha ao conectar com o webhook do Discord.' });
    } finally {
      setTestLoading(false);
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex min-h-screen items-center justify-center overflow-y-auto p-3 sm:p-4 md:p-6">
      {/* Backdrop suave */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Content - Centralizado e seguro contra clipping */}
      <div className="relative my-auto flex max-h-[calc(100vh-2rem)] sm:max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-5 sm:p-7 shadow-2xl z-10">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 sm:right-6 sm:top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Fixo */}
        <div className="flex-shrink-0 flex items-start sm:items-center gap-3 pr-10 border-b border-zinc-800/80 pb-4">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-400 shadow-sm shadow-amber-500/20">
            <Bell className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
              Criar Alerta de Menor Preço
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5 truncate">
              {deal.title}
            </p>
          </div>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 min-h-0 overflow-y-auto mt-4 pr-1 space-y-4">
          {/* Info do Preço Atual */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-3.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium">Menor preço atual encontrado:</span>
            <span className="text-sm font-extrabold text-emerald-400">R$ {currentPriceBRL}</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveAlert} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Meta de Preço Desejada (R$)
              </label>
              <input
                type="text"
                value={targetPriceBRL}
                onChange={(e) => setTargetPriceBRL(e.target.value)}
                placeholder="Ex: 49,90"
                required
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm font-bold text-emerald-400 placeholder-zinc-500 focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none transition"
              />
              <span className="text-[11px] text-zinc-500 mt-1 block">
                Sugestão: R$ {suggestedTargetBRL} (15% abaixo do preço atual).
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Webhook do Discord (Opcional)
                </label>
                <a
                  href="https://support.discord.com/hc/pt-br/articles/228383668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Como criar</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:bg-zinc-900 focus:outline-none transition"
                />
                {discordWebhook && (
                  <button
                    type="button"
                    onClick={handleTestWebhook}
                    disabled={testLoading}
                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-xs font-bold text-indigo-400 hover:bg-indigo-500/20 transition flex items-center gap-1 flex-shrink-0"
                    title="Testar envio no Discord"
                  >
                    {testLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    <span>Testar</span>
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Seu E-mail (Opcional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:bg-zinc-900 focus:outline-none transition"
              />
            </div>

            {status && (
              <div
                className={`rounded-2xl p-3.5 text-xs flex items-start gap-2.5 ${
                  status.error
                    ? 'border border-red-500/30 bg-red-950/20 text-red-300'
                    : 'border border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                }`}
              >
                {status.error ? (
                  <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{status.error || status.success}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs sm:text-sm font-extrabold text-zinc-950 transition hover:opacity-95 shadow-lg shadow-amber-500/25 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Salvando Alerta...</span>
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4" />
                  <span>Ativar Alerta de Menor Preço</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
