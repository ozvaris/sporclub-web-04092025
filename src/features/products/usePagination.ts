// src/features/products/usePagination.ts
'use client';

import { useRouter } from 'next/navigation';
import { ProductQueryParams } from './params';

export function usePagination(params: ProductQueryParams) {
  const router = useRouter();

  const goTo = (page: number) => {
    const usp = new URLSearchParams();
    usp.set('page', String(Math.max(1, page)));
    if (params.q) usp.set('q', params.q);
    if (params.sortBy) usp.set('sortBy', params.sortBy);
    if (params.order) usp.set('order', params.order);

    router.replace(`/?${usp.toString()}`);
  };

  return { goTo };
}
