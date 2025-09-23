// src/app/api/posts/global/[postId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { getGlobalPostDetail } from '@/server/services/posts';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const data = await getGlobalPostDetail(postId);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Global haber detayı getirilemedi', 400);
  }
}
