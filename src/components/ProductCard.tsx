// src/components/ProductCard.tsx
'use client';

import Image from 'next/image';
import type { Product } from '@/types/Product';

function formatPrice(price: number) {
  try {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  } catch {
    return `${price} ₺`;
  }
}

export default function ProductCard({ p }: { p: Product }) {
  const img = p.image ?? '/blank.png';

  return (
    <article className="group rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-lg">
      <div className="relative w-full  h-[400px] aspect-square overflow-hidden rounded-xl">
        <Image
          src={img}
          alt={p.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          priority={false}
        />
      </div>

      {/* <div className="mt-3 space-y-1">
        <h3 className="line-clamp-1 text-sm font-medium text-gray-900">{p.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">{formatPrice(p.price)}</span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] ${
              p.stock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
            }`}
            title={p.stock > 0 ? 'Stokta' : 'Tükendi'}
          >
            {p.stock > 0 ? 'Stokta' : 'Tükendi'}
          </span>
        </div>
      </div> */}

      {/* CTA alanı – ileride sepete ekle vs. eklenebilir */}
      {/* <button className="mt-3 w-full rounded-xl bg-black text-white py-2 text-sm hover:bg-gray-900">
        Sepete Ekle
      </button> */}
    </article>
  );
}
