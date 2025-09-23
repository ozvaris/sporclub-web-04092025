// src/app/api/clubs/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '@/app/api/_lib/routeError';
import { deleteClub, getClub, updateClub } from '@/server/services/clubs';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await getClub(slug);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Kulüp bilgisi getirilemedi', 400);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const data = await updateClub(slug, body);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Kulüp güncelleme başarısız', 400);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const data = await deleteClub(slug);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, 'Kulüp silme başarısız', 400);
  }
}
