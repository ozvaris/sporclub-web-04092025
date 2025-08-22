// src/types/Product.ts
export interface Product {
  id: number;
  name: string;
  image: string | null;
  description: string | null;
  price: number;
  stock: number;
  created_at: string; // ISO
  updated_at: string; // ISO
}

export interface ProductsMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
  sortBy?: string;
  order?: "ASC" | "DESC";
  q?: string | null;
}

export interface ProductsPaged {
  data: Product[];
  meta: ProductsMeta;
}

