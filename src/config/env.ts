// src/config/env.ts
// Tek noktadan ürün sayfa boyutu okuma (SSR & Client güvenli)
export const env = {
  productsPageSize: (() => {
    // SSR'da önce PRODUCTS_PAGE_SIZE, yoksa NEXT_PUBLIC_ olanı; 
    // Client'ta sadece NEXT_PUBLIC_ erişilebilir.
    const raw =
      typeof window === "undefined"
        ? process.env.PRODUCTS_PAGE_SIZE ?? process.env.NEXT_PUBLIC_PRODUCTS_PAGE_SIZE
        : process.env.NEXT_PUBLIC_PRODUCTS_PAGE_SIZE;

    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : 12; // default fallback
  })(),
};
