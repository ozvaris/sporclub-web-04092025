// src/lib/products.ts
import { fetchApi } from "@/lib/fetchApi";
import type { Product, ProductsPaged } from '@/types/Product';

type Params = {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
};

// Düz dizi (geri uyumluluk / basit grid)
export async function fetchProductsRaw(params?: Params) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.q) qs.set('q', params.q);
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.order) qs.set('order', params.order);
  const url = `/api/products${qs.toString() ? `?${qs}` : ''}`;
  return fetchApi<Product[]>(url);
}

// Paged kullanım (meta bilgisi ile)
export async function fetchProductsPaged(params?: Params) {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.q) qs.set('q', params.q);
  if (params?.sortBy) qs.set('sortBy', params.sortBy);
  if (params?.order) qs.set('order', params.order);
  qs.set('paged', '1'); // tam gövde talebi

  return fetchApi<ProductsPaged>(`/api/products?${qs.toString()}`);
}



