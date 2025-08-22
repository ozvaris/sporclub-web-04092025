// src/lib/normalizers/product.ts

import type { Product, ProductsMeta, ProductsPaged } from "@/types/Product";

/** Backend cevabındaki listeyi çıkarır (array | {data} | {items}) */
export function pickArray(raw: any): any[] {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
}

/** Tek bir ürün kaydını FE’nin beklediği ProductDTO şekline getirir */
export function normalizeProduct(o: any): Product {
  return {
    id: o?.id ?? o?.productId ?? o?._id,
    name: o?.name ?? o?.title ?? '',
    image: o?.image ?? o?.imageUrl ?? o?.thumbnail ?? null,
    description: o?.description ?? o?.desc ?? '',
    price: Number(o?.price ?? o?.unitPrice ?? 0),
    stock: Number(o?.stock ?? o?.quantity ?? o?.stockCount ?? 0),
    created_at: o?.created_at ?? o?.createdAt ?? '',
    updated_at: o?.updated_at ?? o?.updatedAt ?? '',
  };
}

/** Paged cevabı normalize eder (liste + meta) */
export function normalizePaged(raw: any, defaults?: Partial<ProductsMeta>): ProductsPaged {
  const list = pickArray(raw).map(normalizeProduct);

  const total = Number(raw?.meta?.total ?? list.length ?? 0);
  const limit = Number(raw?.meta?.limit ?? defaults?.limit ?? (list.length || 10));

  const pages =
    Number(raw?.meta?.pages ?? defaults?.pages) ||
    Math.max(1, Math.ceil(total / Math.max(1, limit)));

  const meta: ProductsMeta = {
    total,
    page: Number(raw?.meta?.page ?? defaults?.page ?? 1),
    limit,
    pages,
    sortBy: raw?.meta?.sortBy ?? defaults?.sortBy,
    order: raw?.meta?.order ?? defaults?.order,
    q: raw?.meta?.q ?? defaults?.q ?? null,
  };

  return { data: list, meta };
}
