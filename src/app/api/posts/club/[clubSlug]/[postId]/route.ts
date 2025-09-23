// src/app/api/posts/club/[clubSlug]/[postId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { getClubPostDetail } from '@/server/services/posts';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clubSlug: string; postId: string }> }
) {
  try {
    const { clubSlug, postId } = await params;
    const data = await getClubPostDetail(clubSlug, postId);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Kulüp haber detayı getirilemedi', 400);
  }
}
