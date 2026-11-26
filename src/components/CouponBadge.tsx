'use client';

import React, { useState } from 'react';
import { Tag, Check, Copy } from 'lucide-react';

interface CouponBadgeProps {
  code: string;
  discountText: string;
}

export function CouponBadge({ code, discountText }: CouponBadgeProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Clique para copiar o cupom"
      className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-300 transition hover:bg-amber-500/20"
    >
      <Tag className="h-3 w-3" />
      <span>{code}</span>
      <span className="text-[10px] font-normal text-amber-400/90">({discountText})</span>
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 opacity-70" />}
    </button>
  );
}
