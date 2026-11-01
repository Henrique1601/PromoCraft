import React from 'react';
import { ExternalLink, ShoppingBag, ShieldCheck, AlertCircle } from 'lucide-react';
import { getExternalMarketplaces } from '@/lib/links';

interface MarketplaceLinksCardProps {
  title: string;
}

export function MarketplaceLinksCard({ title }: MarketplaceLinksCardProps) {
  const marketplaces = getExternalMarketplaces(title);

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/80 pb-4">
        <div>
          <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
            <span>Consultar em Marketplaces & Lojas Externas</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compare o preço deste jogo na <b>Eneba</b>, <b>Nuuvem</b> e <b>Kinguin</b> com busca direta em um clique.
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-2.5 py-1 text-[11px] text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Verificação de Procedência</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {marketplaces.map((m) => {
          const isOfficial = m.type === 'official';

          return (
            <div
              key={m.name}
              className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-zinc-700 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-zinc-100">{m.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      isOfficial
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {m.badge}
                  </span>
                </div>

                <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                  {m.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80">
                <a
                  href={m.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition shadow-sm ${
                    m.name === 'Eneba'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-purple-950/40'
                      : m.name === 'Nuuvem'
                      ? 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-emerald-950/40'
                      : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <span>Ver Ofertas na {m.name}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-3 text-[11px] text-zinc-400 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-zinc-400 flex-shrink-0 mt-0.5" />
        <span>
          <b>Transparência PromoCraft:</b> A tabela principal acima monitora lojas 100% autorizadas pelas distribuidoras. Lojas como a <b>Eneba</b> e a <b>Kinguin</b> operam como marketplaces de múltiplos vendedores; sempre verifique a reputação do vendedor e as taxas de pagamento no carrinho antes de concluir a compra.
        </span>
      </div>
    </div>
  );
}
