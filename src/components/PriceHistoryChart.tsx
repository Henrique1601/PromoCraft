'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  currentPrice: number;
  cheapestEverPrice: number;
  retailPrice: number;
  currencyPrefix?: string;
  rate?: number;
}

export function PriceHistoryChart({
  currentPrice,
  cheapestEverPrice,
  retailPrice,
  currencyPrefix = 'R$',
  rate = 5.75,
}: PriceHistoryChartProps) {
  // Gera curva com base no menor histórico, preço atual e preço base para contextualização
  const curBRL = parseFloat((currentPrice * rate).toFixed(2));
  const cheapBRL = parseFloat((cheapestEverPrice * rate).toFixed(2));
  const retailBRL = parseFloat((retailPrice * rate).toFixed(2));

  // Amostragem simulada de 6 meses ponderada
  const data: PricePoint[] = [
    { date: '6 meses atrás', price: retailBRL },
    { date: '5 meses atrás', price: parseFloat((retailBRL * 0.85).toFixed(2)) },
    { date: '4 meses atrás', price: cheapBRL },
    { date: '3 meses atrás', price: parseFloat((retailBRL * 0.7).toFixed(2)) },
    { date: '2 meses atrás', price: retailBRL },
    { date: 'Mês passado', price: parseFloat((curBRL * 1.1).toFixed(2)) },
    { date: 'Hoje (Atual)', price: curBRL },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-zinc-800/60 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>Tendência & Histórico de Preços</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Comparação da oscilação de valores com o menor histórico já registrado.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span className="text-zinc-300">Menor Histórico: <b>R$ {cheapBRL.toFixed(2).replace('.', ',')}</b></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-zinc-500"></span>
            <span className="text-zinc-400">Preço Regular: <b>R$ {retailBRL.toFixed(2).replace('.', ',')}</b></span>
          </div>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#27272a' }}
              tickFormatter={(val) => `R$${val}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-zinc-700 bg-zinc-950 p-2.5 shadow-xl text-xs">
                      <p className="text-zinc-400 font-medium">{label}</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">
                        {currencyPrefix} {Number(payload[0].value).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine
              y={cheapBRL}
              stroke="#10b981"
              strokeDasharray="3 3"
              label={{
                value: 'Recorde Histórico',
                fill: '#10b981',
                fontSize: 10,
                position: 'insideBottomRight',
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#priceGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
