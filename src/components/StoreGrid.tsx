// src/components/StoreGrid.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import Pagination1 from './Pagination1';
import { fetchProductsPaged } from '@/features/products/api';
import { useProductParams } from '@/features/products/useProductParams';
import { usePagination } from '@/features/products/usePagination';
import { PRODUCTS_PER_PAGE } from '@/features/products/constants';


export default function StoreGrid() {
  const router = useRouter();
  const params = useProductParams(PRODUCTS_PER_PAGE); // ortak limit

  // const selectToModels = useMemo(
  //   () => (list: IProduct[]) =>
  //     list.filter(p => p.stock > 0)        // stok filtresi
  //         .map(Product.fromJson),          // sınıfa çeviri (yalnızca client)
  //   [],
  // );

  const { data, isLoading, isError } = useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProductsPaged(params),
    //select: selectToModels,                // <- burada modele çevirir
    staleTime: 1000 * 60, // 1 dk
    gcTime: 1000 * 60 * 30, // 30 dk
    // Bu sayfada sadece ürün listesi var, o yüzden bu kadar kısa
    // staleTime yeterli. Normalde 15 dk gibi bir süre kullanılır.
    // gcTime ise 30 dk olarak ayarlanır, çünkü bu sayfada
    // ürün listesi sürekli değişebilir.
    retry: 2,                              // 2 kez dene
    // 401 hatası alırsak retry etme, çünkü token yenileme mekanizması var
    retryOnMount: false,                   // mount sırasında tekrar deneme
    // 500+ hatalar ErrorBoundary’ye düşsün → segment error.tsx gösterilir
    throwOnError: (err: any) => err?.status >= 500
  });

  
  const { goTo } = usePagination(params);

  const skeletons = useMemo(
    () =>
      Array.from({ length: params.limit }).map((_, i) => (
        <div
          key={`sk-${i}`}
          className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm animate-pulse"
        >
          <div className="w-full aspect-square rounded-xl bg-gray-100" />
          <div className="mt-3 h-4 w-3/4 rounded bg-gray-100" />
          <div className="mt-2 h-4 w-1/3 rounded bg-gray-100" />
        </div>
      )),
    [params.limit]
  );

  
 if (isLoading) {
    return (
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Ürünler</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{skeletons}</div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <div className="my-10 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        Ürünler yüklenirken bir sorun oluştu.
      </div>
    );
  }

  const { data: list, meta } = data;
  const empty = !list || list.length === 0;

  // return (
  //   <section className="container max-w-screen-xl mx-auto py-8 grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
  //     {data.map((p) => (
  //       <ProductCard key={p.id} p={p} />
  //     ))}
  //   </section>
  // );

  return (
    <section className="mb-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-xl font-semibold">Futbolcular</h2>

        {/* Basit filtre/sort placeholder (ileride Controls eklenebilir) */}
        <div className="flex items-center gap-2 text-sm">
          {/* Örn. arama/sıralama UI'i burada geliştirilebilir */}
        </div>
      </div>

      {empty ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-gray-600">
          Futbolcu bulunamadı
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {list.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination meta={meta} params={params} />
        </>
      )}
    </section>
  );
}


