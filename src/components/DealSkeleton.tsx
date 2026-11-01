import React from 'react';

interface DealSkeletonProps {
  viewMode?: 'grid' | 'compact' | 'list';
  count?: number;
}

export function DealSkeleton({ viewMode = 'grid', count = 8 }: DealSkeletonProps) {
  const items = Array.from({ length: count });

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {items.map((_, i) => (
          <div
            key={i}
            className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 animate-pulse"
          >
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-14 w-24 flex-shrink-0 rounded-lg bg-zinc-800/70" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-48 rounded bg-zinc-800/80" />
                <div className="h-3 w-28 rounded bg-zinc-800/50" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-12 rounded bg-zinc-800/60" />
              <div className="h-8 w-20 rounded-lg bg-zinc-800/80" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (viewMode === 'compact') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 animate-pulse"
          >
            <div className="aspect-[16/10] w-full rounded-lg bg-zinc-800/70" />
            <div className="mt-2 space-y-1.5">
              <div className="h-3.5 w-full rounded bg-zinc-800/80" />
              <div className="h-3 w-1/2 rounded bg-zinc-800/50" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-3 animate-pulse"
        >
          <div className="aspect-[16/9] w-full rounded-lg bg-zinc-800/70" />
          <div className="mt-3 space-y-2">
            <div className="h-4 w-5/6 rounded bg-zinc-800/80" />
            <div className="h-3 w-1/3 rounded bg-zinc-800/50" />
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800/60 pt-3">
            <div className="h-5 w-16 rounded bg-zinc-800/80" />
            <div className="h-8 w-20 rounded-lg bg-zinc-800/70" />
          </div>
        </div>
      ))}
    </div>
  );
}
