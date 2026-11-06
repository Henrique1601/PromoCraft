'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, HardDrive, Monitor, CheckCircle2, AlertTriangle, Layers, Loader2 } from 'lucide-react';

interface SystemRequirementsCardProps {
  steamAppID: string;
  title: string;
}

export function SystemRequirementsCard({ steamAppID, title }: SystemRequirementsCardProps) {
  const [loading, setLoading] = useState(true);
  const [specs, setSpecs] = useState<{
    minimum?: string | null;
    recommended?: string | null;
    developers?: string[];
    publishers?: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'minimum' | 'recommended'>('minimum');

  useEffect(() => {
    if (!steamAppID || steamAppID === '0') {
      setLoading(false);
      return;
    }

    async function loadSpecs() {
      try {
        const res = await fetch(`/api/steam/specs?appId=${steamAppID}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSpecs(data);
          }
        }
      } catch (err) {
        console.warn('Não foi possível carregar requisitos de sistema:', err);
      } finally {
        setLoading(false);
      }
    }

    loadSpecs();
  }, [steamAppID]);

  if (!steamAppID || steamAppID === '0' || (!loading && !specs?.minimum)) {
    return null;
  }

  // Limpa o HTML bruto retornado pela Steam para adequar ao design escuro
  function formatHtml(rawHtml?: string | null) {
    if (!rawHtml) return 'Requisitos não especificados pelo desenvolvedor.';
    return rawHtml
      .replace(/<strong>/g, '<strong class="text-zinc-100 font-bold">')
      .replace(/<ul class="bb_ul">/g, '<ul class="space-y-1.5 mt-2">')
      .replace(/<li>/g, '<li class="text-xs text-zinc-300 leading-relaxed flex items-start gap-1.5 before:content-[\'•\'] before:text-emerald-400">');
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 shadow-xl backdrop-blur-md space-y-4">
      {/* Header do Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-400">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Requisitos de Sistema ("Roda no Meu PC?")</h3>
              <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Steam Oficial
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Especificações de hardware mínimas e recomendadas para rodar <b>{title}</b> no PC.
            </p>
          </div>
        </div>

        {/* Abas Mínimo vs Recomendado */}
        {specs?.recommended && (
          <div className="flex items-center gap-1 rounded-xl bg-zinc-950 p-1 border border-zinc-800 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('minimum')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'minimum'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Mínimos
            </button>
            <button
              onClick={() => setActiveTab('recommended')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'recommended'
                  ? 'bg-zinc-800 text-emerald-400 shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Recomendados
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Consultando especificações oficiais de hardware...</span>
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-950/60 border border-zinc-800/80 p-4 text-xs text-zinc-300">
          <div
            className="prose prose-invert max-w-none text-xs leading-relaxed space-y-1.5"
            dangerouslySetInnerHTML={{
              __html:
                activeTab === 'minimum'
                  ? formatHtml(specs?.minimum)
                  : formatHtml(specs?.recommended || specs?.minimum),
            }}
          />
        </div>
      )}
    </div>
  );
}
