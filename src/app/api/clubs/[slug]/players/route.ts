// src/app/api/clubs/[slug]/players/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { addClubPlayer, listClubPlayers, patchClubPlayer } from '@/server/services/clubs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await listClubPlayers(slug);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Oyuncular yüklenemedi', 400);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const data = await addClubPlayer(slug, body);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Oyuncu eklenemedi', 400);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json(); // { id, ...payload }
    const data = await patchClubPlayer(slug, body);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Oyuncu güncellenemedi', 400);
  }
}
