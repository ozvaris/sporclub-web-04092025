// src/app/api/posts/club/[clubSlug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { listClubPosts } from '@/server/services/posts';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubSlug: string }> }
) {
  try {
    const { clubSlug } = await params;
    const sp = new URL(req.url).searchParams;

    const p = {
      type: sp.get('type') ?? undefined,
      exclude: sp.get('exclude') ?? undefined,
      limit: sp.get('limit') ?? undefined,
      page: sp.get('page') ?? undefined,
      tags: sp.get('tags') ?? undefined,
      categories: sp.get('categories') ?? undefined,
    };

    const data = await listClubPosts(clubSlug, p);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Kulüp haberleri yüklenemedi', 400);
  }
}
