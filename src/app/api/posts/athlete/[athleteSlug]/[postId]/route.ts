// src/app/api/posts/athlete/[athleteSlug]/[postId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { getAthletePostDetail } from '@/server/services/posts';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ athleteSlug: string; postId: string }> }
) {
  try {
    const { athleteSlug, postId } = await params;
    const data = await getAthletePostDetail(athleteSlug, postId);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Sporcu haberi detayı getirilemedi', 400);
  }
}
