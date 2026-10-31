'use client';

import React, { useState } from 'react';
import { Tag, Copy, Check, Sparkles, Percent } from 'lucide-react';

interface Coupon {
  code: string;
  store: string;
  discount: string;
  description: string;
  expires: string;
}

const ACTIVE_COUPONS: Coupon[] = [
  {
    code: 'NUUVALE',
    store: 'Nuuvem',
    discount: '10% OFF',
    description: 'Válido em lançamentos e pré-vendas selecionadas para PC.',
    expires: 'Válido hoje',
  },
  {
    code: 'SAVE15',
    store: 'Green Man Gaming',
    discount: '15% OFF',
    description: 'Aplicável em títulos catalogados com desconto adicional no carrinho.',
    expires: 'Válido hoje',
  },
  {
    code: 'FANATICAL10',
    store: 'Fanatical',
    discount: '10% OFF',
    description: 'Cupom de fidelidade em compras de bundles e chaves individuais.',
    expires: 'Sazonal',
  },
];

export function CouponTracker() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  function copyToClipboard(code: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Percent className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>Cupons de Desconto em Lojas Parceiras</span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] px-2 py-0.2">
                Ativos
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Copie o cupom e aplique no checkout da loja oficial para abater o preço.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ACTIVE_COUPONS.map((coupon) => {
          const isCopied = copiedCode === coupon.code;

          return (
            <div
              key={coupon.code}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-3.5 transition hover:border-zinc-700 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    {coupon.store}
                  </span>
                  <span className="rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5">
                    {coupon.discount}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-300 line-clamp-2">
                  {coupon.description}
                </p>
              </div>

              <div className="mt-3.5 flex items-center justify-between pt-2.5 border-t border-zinc-800/80">
                <span className="font-mono text-xs font-bold text-zinc-100 bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
                  {coupon.code}
                </span>

                <button
                  type="button"
                  onClick={() => copyToClipboard(coupon.code)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    isCopied
                      ? 'bg-emerald-500 text-zinc-950 font-bold'
                      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
