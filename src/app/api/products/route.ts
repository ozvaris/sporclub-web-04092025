// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { fetchApi } from '@/lib/fetchApi';
import { normalizePaged, pickArray, normalizeProduct } from '@/lib/normalizers/product';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // backend'e forward edeceğimiz query param'lar
    const passKeys = ['page', 'limit', 'q', 'sortBy', 'order'];
    const search = new URLSearchParams();
    for (const k of passKeys) {
      const v = url.searchParams.get(k);
      if (v != null) search.set(k, v);
    }

    const paged = url.searchParams.get('paged') === '1';


    const raw = await fetchApi<any>(`/products${search.toString() ? `?${search}` : ''}`);

    if (paged) {
      const defaults = {
        page: Number(url.searchParams.get('page') ?? 1),
        limit: Number(url.searchParams.get('limit') ?? 12),
        sortBy: url.searchParams.get('sortBy') ?? 'created_at',
        order: (url.searchParams.get('order') as 'ASC' | 'DESC') ?? 'DESC',
        q: url.searchParams.get('q') ?? null,
      };
      const normalized = normalizePaged(raw, defaults);
      return NextResponse.json(normalized); // { data, meta }
    }


    // geri uyumluluk: düz dizi
    const list = pickArray(raw).map(normalizeProduct);
    return NextResponse.json(list);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? 'Failed to load products' },
      { status: e?.status ?? 500 }
    );
  }
}
