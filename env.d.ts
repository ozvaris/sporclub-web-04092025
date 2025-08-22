declare namespace NodeJS {
  interface ProcessEnv {
    PRODUCTS_PAGE_SIZE?: string;              // SSR only
    NEXT_PUBLIC_PRODUCTS_PAGE_SIZE?: string;  // SSR & Client
  }
}
