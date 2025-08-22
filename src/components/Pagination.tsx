// src/components/Pagination.tsx
'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { ProductQueryParams } from '@/features/products/params';

type Meta = {
  page: number;
  pages: number;
  total?: number;
};

type Props = {
  meta: Meta;
  params: ProductQueryParams;   // page hariç diğer q/sort/order/limit
  basePath?: string;            // varsayılan: "/"
  windowSize?: number;          // ortadaki sayfa düğmesi sayısı (default 5)
};

export default function Pagination({
  meta,
  params,
  basePath = '/',
  windowSize = 5,
}: Props) {
  const router = useRouter();
  const canPrev = meta.page > 1;
  const canNext = meta.page < meta.pages;

  const createHref = (page: number) => {
    const usp = new URLSearchParams();
    usp.set('page', String(Math.max(1, Math.min(page, Math.max(1, meta.pages || 1)))));
    if (params.q) usp.set('q', params.q);
    if (params.sortBy) usp.set('sortBy', params.sortBy);
    if (params.order) usp.set('order', params.order);
    // limit'i URL'e koymak istersen:
    // if (params.limit) usp.set('limit', String(params.limit));
    return `${basePath}?${usp.toString()}`;
  };

  const pages = useMemo(() => {
    const total = Math.max(1, meta.pages || 1);
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, meta.page - half);
    let end = Math.min(total, start + windowSize - 1);
    // başı/sonu taşarsa dengele
    start = Math.max(1, Math.min(start, Math.max(1, end - windowSize + 1)));
    end = Math.min(total, Math.max(end, start + windowSize - 1));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [meta.page, meta.pages, windowSize]);

  const go = (page: number) => router.replace(createHref(page));

  return (
    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Sayfalama">
      <button
        onClick={() => go(meta.page - 1)}
        disabled={!canPrev}
        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm disabled:opacity-50 hover:shadow-sm"
        aria-label="Önceki sayfa"
      >
        ←
      </button>

      {/* İlk sayfa kısayolu */}
      {!pages.includes(1) && (
        <>
          <button
            onClick={() => go(1)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm hover:shadow-sm"
          >
            1
          </button>
          <span className="px-2 text-gray-400">…</span>
        </>
      )}

      {pages.map((p) => {
        const active = p === meta.page;
        return (
          <button
            key={p}
            onClick={() => go(p)}
            aria-current={active ? 'page' : undefined}
            className={[
              'px-3 py-1.5 rounded-lg text-sm',
              active
                ? 'bg-gray-900 text-white shadow-sm'
                : 'border border-gray-200 bg-white hover:shadow-sm',
            ].join(' ')}
          >
            {p}
          </button>
        );
      })}
      
      {/* Son sayfa kısayolu */}
      {!pages.includes(meta.pages) && meta.pages > 0 && (
        <>
          <span className="px-2 text-gray-400">…</span>
          <button
            onClick={() => go(meta.pages)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm hover:shadow-sm"
          >
            {meta.pages}
          </button>
        </>
      )}

      <button
        onClick={() => go(meta.page + 1)}
        disabled={!canNext}
        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm disabled:opacity-50 hover:shadow-sm"
        aria-label="Sonraki sayfa"
      >
        →
      </button>
    </nav>
  );
}
