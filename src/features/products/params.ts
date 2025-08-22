import { PRODUCTS_PER_PAGE } from "./constants";

// src/features/products/params.ts
export { PRODUCTS_PER_PAGE } from "./constants";

export type SearchParams = {
  page?: string;
  q?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
};

export type ProductQueryParams = {
  page: number;
  limit: number;
  q: string;
  sortBy: string;
  order: 'ASC' | 'DESC';
};


/** SearchParams → ProductQueryParams (saf, her yerde kullanılabilir) */
export function toProductParams(
  sp: SearchParams,
  limit: number = PRODUCTS_PER_PAGE
): ProductQueryParams {
  return {
    page: Math.max(1, Number(sp.page ?? 1)),
    limit,
    q: sp.q ?? '',
    sortBy: sp.sortBy ?? 'created_at',
    order: (sp.order as 'ASC' | 'DESC') ?? 'DESC',
  };
}
