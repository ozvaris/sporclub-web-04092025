// src/app/api/clubs/[slug]/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { listClubPosts } from '@/server/services/clubs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await listClubPosts(slug);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Kulüp haberleri yüklenemedi', 400);
  }
}
