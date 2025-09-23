// src/app/api/posts/global/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { listGlobalPosts } from '@/server/services/posts';

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;

    const p = {
      type: sp.get('type') ?? undefined,
      exclude: sp.get('exclude') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      page: sp.get('page') ?? undefined,
      tags: sp.get('tags') ?? undefined,
      categories: sp.get('categories') ?? undefined,
    };

    const data = await listGlobalPosts(p);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Global haberler yüklenemedi', 400);
  }
}
