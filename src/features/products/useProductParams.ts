// src/features/products/useProductParams.ts
'use client';

import { useSearchParams } from 'next/navigation';
import { toProductParams, type ProductQueryParams } from './params';
import { PRODUCTS_PER_PAGE } from './constants';

/** URL'den query string'i okuyup ortak param objesine çevirir (client) */
export function useProductParams(limit = PRODUCTS_PER_PAGE): ProductQueryParams {
  const sp = useSearchParams();
  return toProductParams(
    {
      page: sp.get('page') ?? undefined,
      q: sp.get('q') ?? undefined,
      sortBy: sp.get('sortBy') ?? undefined,
      order: (sp.get('order') as 'ASC' | 'DESC') ?? undefined,
    },
    limit
  );
}
