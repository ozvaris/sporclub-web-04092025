// src/app/page.tsx
// Server Component
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Carousel from "@/components/Carousel";
import StoreGrid from "@/components/StoreGrid";

import { QueryClientServer } from "@/lib/queryClientServer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { fetchProductsPaged } from "@/features/products/api";
import { toProductParams, type SearchParams } from '@/features/products/params';
import { PRODUCTS_PER_PAGE } from '@/features/products/constants';

export const metadata = {
  title: "Talenty Shop",
  description: "Vitrin — sayfalama destekli ürün listesi",
};

const slides = [
  { src: "http://localhost:3000/media/dev-images/club1.jpg", alt: "Kampanya 1" },
  { src: "http://localhost:3000/media/dev-images/club2.webp", alt: "Kampanya 2" },
  { src: "http://localhost:3000/media/dev-images/club3.jpg", alt: "Kampanya 3" },
];

export default async function Home({ searchParams }: { searchParams: Promise<SearchParams> }) {

  const sp = await searchParams;
  const params = toProductParams(sp, PRODUCTS_PER_PAGE);

  const queryClientServer = QueryClientServer();

  await queryClientServer.prefetchQuery({
    queryKey: ['products', params ],
    queryFn: () => fetchProductsPaged(params ),
    staleTime: 1000 * 60, // 1 dk
    gcTime: 1000 * 60 * 30, // 30 dk
    // Bu sayfada sadece ürün listesi var, o yüzden bu kadar kısa
    // staleTime yeterli. Normalde 15 dk gibi bir süre kullanılır.
  });

  const state = dehydrate(queryClientServer);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="container max-w-screen-xl mx-auto px-4 md:px-6">
        <Carousel 
        slides={slides}
        autoPlay 
        heightClass="h-56 sm:h-72 md:h-[420px]" />
        <StoreGrid />
      </main>
      <Footer />
    </HydrationBoundary>
  );

}
