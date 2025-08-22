'use client';

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
};

export default function Pagination({ meta, params, basePath = '/' }: Props) {
  const router = useRouter();

  const createHref = (page: number) => {
    const usp = new URLSearchParams();
    usp.set('page', String(Math.max(1, Math.min(page, meta.pages))));
    if (params.q) usp.set('q', params.q);
    if (params.sortBy) usp.set('sortBy', params.sortBy);
    if (params.order) usp.set('order', params.order);
    return `${basePath}?${usp.toString()}`;
  };

  const go = (page: number) => {
    router.replace(createHref(page));
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <button
        onClick={() => go(meta.page - 1)}
        disabled={meta.page <= 1}
        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm disabled:opacity-50 hover:shadow-sm"
      >
        ← Önceki
      </button>

      <span className="px-3 py-1.5 text-sm text-gray-600">
        Sayfa <b>{meta.page}</b> / {meta.pages}
      </span>

      <button
        onClick={() => go(meta.page + 1)}
        disabled={meta.page >= meta.pages}
        className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm disabled:opacity-50 hover:shadow-sm"
      >
        Sonraki →
      </button>
    </div>
  );
}
