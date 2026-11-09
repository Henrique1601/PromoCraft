'use client';

import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { sound } from '@/lib/sound';

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

type TimeRange = '3M' | '6M' | '1A' | 'ALL';

export function PriceHistoryChart({
  currentPrice,
  cheapestEverPrice,
  retailPrice,
  currencyPrefix = 'R$',
  rate = 5.75,
}: PriceHistoryChartProps) {
  const [range, setRange] = useState<TimeRange>('6M');

  const curBRL = parseFloat((currentPrice * rate).toFixed(2));
  const cheapBRL = parseFloat((cheapestEverPrice * rate).toFixed(2));
  const retailBRL = parseFloat((retailPrice * rate).toFixed(2));

  // Amostragem simulada adaptativa baseada no range selecionado
  const data: PricePoint[] = useMemo(() => {
    switch (range) {
      case '3M':
        return [
          { date: '3 meses atrás', price: parseFloat((retailBRL * 0.8).toFixed(2)) },
          { date: '2 meses atrás', price: retailBRL },
          { date: '6 semanas atrás', price: cheapBRL },
          { date: '4 semanas atrás', price: parseFloat((retailBRL * 0.9).toFixed(2)) },
          { date: '2 semanas atrás', price: parseFloat((curBRL * 1.05).toFixed(2)) },
          { date: 'Hoje (Atual)', price: curBRL },
        ];
      case '1A':
        return [
          { date: '12 meses atrás', price: retailBRL },
          { date: '10 meses atrás', price: parseFloat((retailBRL * 0.85).toFixed(2)) },
          { date: '8 meses atrás', price: retailBRL },
          { date: '6 meses atrás', price: cheapBRL },
          { date: '4 meses atrás', price: parseFloat((retailBRL * 0.75).toFixed(2)) },
          { date: '2 meses atrás', price: parseFloat((curBRL * 1.15).toFixed(2)) },
          { date: 'Hoje (Atual)', price: curBRL },
        ];
      case 'ALL':
        return [
          { date: 'Lançamento', price: retailBRL },
          { date: 'Ano 1', price: parseFloat((retailBRL * 0.9).toFixed(2)) },
          { date: 'Ano 2', price: parseFloat((retailBRL * 0.75).toFixed(2)) },
          { date: 'Recorde', price: cheapBRL },
          { date: 'Promoção Recente', price: parseFloat((curBRL * 1.1).toFixed(2)) },
          { date: 'Hoje (Atual)', price: curBRL },
        ];
      case '6M':
      default:
        return [
          { date: '6 meses atrás', price: retailBRL },
          { date: '5 meses atrás', price: parseFloat((retailBRL * 0.85).toFixed(2)) },
          { date: '4 meses atrás', price: cheapBRL },
          { date: '3 meses atrás', price: parseFloat((retailBRL * 0.7).toFixed(2)) },
          { date: '2 meses atrás', price: retailBRL },
          { date: 'Mês passado', price: parseFloat((curBRL * 1.1).toFixed(2)) },
          { date: 'Hoje (Atual)', price: curBRL },
        ];
    }
  }, [range, curBRL, cheapBRL, retailBRL]);

  const handleRangeChange = (newRange: TimeRange) => {
    sound.playClick();
    setRange(newRange);
  };

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-zinc-800/60 pb-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <span>Tendência & Histórico de Preços</span>
          </h3>
          <p className="text-xs text-zinc-400">
            Comparação da oscilação de valores com o menor histórico já registrado.
          </p>
        </div>

        {/* Seletores de Range Temporal */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 p-0.5 text-[11px] font-semibold">
            {(['3M', '6M', '1A', 'ALL'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRangeChange(r)}
                className={`rounded-lg px-2.5 py-1 transition ${
                  range === r
                    ? 'bg-emerald-500 text-zinc-950 font-bold shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {r === 'ALL' ? 'Tudo' : r}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-xs pl-2 border-l border-zinc-800">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-zinc-300">Recorde: <b>R$ {cheapBRL.toFixed(2).replace('.', ',')}</b></span>
            </div>
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
