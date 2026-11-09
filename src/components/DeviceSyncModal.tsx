'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Monitor, QrCode, Copy, Check, Download, Upload, X, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { sound } from '@/lib/sound';

interface DeviceSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const LOCAL_STORAGE_KEY = 'promocraft_wishlist_v1';

export function DeviceSyncModal({ isOpen, onClose, onSuccess }: DeviceSyncModalProps) {
  const [tab, setTab] = useState<'export' | 'import'>('export');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [inputCode, setInputCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fechar com Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  async function handleGenerateCode() {
    setLoading(true);
    setStatusMessage(null);
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      const wishlist = raw ? JSON.parse(raw) : [];

      if (!wishlist || wishlist.length === 0) {
        setStatusMessage({
          type: 'error',
          text: 'Sua Wishlist local está vazia. Adicione alguns jogos ou importe da Steam antes de sincronizar.',
        });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/sync/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wishlist }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedCode(data.code);
        sound.playSuccess();
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Falha ao gerar código de sincronização.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  }

  async function handleImportCode(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return;

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/sync/session?code=${encodeURIComponent(cleanCode)}`);
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.wishlist)) {
        const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const existingIds = new Set(existing.map((i: any) => i.gameID));

        const newItems = data.wishlist.filter((g: any) => g && g.gameID && !existingIds.has(g.gameID));
        const merged = [...newItems, ...existing];

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('wishlist-updated'));

        sound.playSuccess();
        setStatusMessage({
          type: 'success',
          text: `Sucesso! ${data.wishlist.length} jogos sincronizados deste aparelho!`,
        });

        if (onSuccess) onSuccess();
      } else {
        setStatusMessage({
          type: 'error',
          text: data.error || 'Código inválido ou expirado. Verifique os caracteres.',
        });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  }

  const qrUrl = generatedCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
        `https://promocraft.netlify.app/wishlist?sync=${generatedCode}`
      )}`
    : null;

  const content = (
    <div className="fixed inset-0 z-[110] flex min-h-screen items-center justify-center p-4">
      {/* Backdrop com blur */}
      <div onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" />

      {/* Card do Modal */}
      <div className="relative my-auto w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl z-10 space-y-4">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-4 pr-8">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-emerald-400 shadow-sm shadow-emerald-500/20">
            <Smartphone className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              <span>Sincronizar Dispositivos</span>
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Espelhe sua lista entre PC, notebook e celular sem precisar criar conta.
            </p>
          </div>
        </div>

        {/* Abas Exportar vs Importar */}
        <div className="flex rounded-xl border border-zinc-800 bg-zinc-900/60 p-1 text-xs font-bold">
          <button
            onClick={() => { sound.playClick(); setTab('export'); setStatusMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              tab === 'export' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Gerar Código</span>
          </button>
          <button
            onClick={() => { sound.playClick(); setTab('import'); setStatusMessage(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition ${
              tab === 'import' ? 'bg-emerald-500 text-zinc-950 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="h-3.5 w-3.5" />
            <span>Digitar Código</span>
          </button>
        </div>

        {/* Aba 1: Exportar / Gerar Código */}
        {tab === 'export' && (
          <div className="space-y-4 pt-1">
            {!generatedCode ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-zinc-300">
                  Clique abaixo para gerar um código seguro temporário de 6 dígitos para transferir sua Wishlist deste aparelho para outro.
                </p>
                <button
                  onClick={handleGenerateCode}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-black text-zinc-950 transition hover:opacity-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  <span>{loading ? 'Gerando Código...' : 'Gerar Código de Transferência'}</span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 text-center space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                  Seu Código de Sincronização:
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-3xl font-black tracking-widest text-white">
                    {generatedCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-2 text-emerald-300 hover:bg-emerald-500/30 transition"
                    title="Copiar código"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Abra o PromoCraft no celular, toque em <b>Digitar Código</b> e informe os 6 caracteres acima.
                </p>
                {qrUrl && (
                  <div className="pt-2 flex flex-col items-center">
                    <img src={qrUrl} alt="QR Code de Sincronização" className="h-28 w-28 rounded-xl border border-emerald-500/30 p-1 bg-white" />
                    <span className="text-[10px] text-zinc-500 mt-1">Ou aponte a câmera do celular para este QR</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Aba 2: Digitar Código */}
        {tab === 'import' && (
          <form onSubmit={handleImportCode} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Código de 6 Caracteres
              </label>
              <input
                type="text"
                maxLength={8}
                placeholder="Ex: PC7X9K"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                disabled={loading}
                className="w-full text-center font-mono text-xl tracking-widest rounded-2xl border border-zinc-800 bg-zinc-900/80 px-4 py-3 text-emerald-400 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition"
              />
              <p className="text-[11px] text-zinc-500 mt-1.5 text-center">
                Digite o código gerado no seu outro dispositivo para mesclar as duas listas.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || inputCode.trim().length < 4}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-xs font-black text-zinc-950 transition hover:opacity-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span>{loading ? 'Resgatando Wishlist...' : 'Sincronizar Neste Aparelho'}</span>
            </button>
          </form>
        )}

        {/* Status Feedback */}
        {statusMessage && (
          <div
            className={`rounded-2xl border p-3.5 text-xs ${
              statusMessage.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300'
                : 'border-red-500/30 bg-red-950/20 text-red-300'
            }`}
          >
            {statusMessage.text}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
