// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '../_lib/routeError';
import { getProfile, updateProfile, deleteProfile } from '@/server/services/profile';

// GET /api/profile -> backend: GET /users/profile
export async function GET() {
  try {
    const data = await getProfile();
    return NextResponse.json(data);
  } catch (e) {
    // Mevcut implementasyonunuzda Unauthorized 401 dönüyordu
    // :contentReference[oaicite:0]{index=0}
    return routeError(e, 'Unauthorized', 401);
  }
}

// PATCH /api/profile -> backend: PATCH /users/profile
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await updateProfile(body);
    return NextResponse.json(data);
  } catch (e) {
    // Önceki mesaj: "Güncelleme başarısız"
    // :contentReference[oaicite:1]{index=1}
    return routeError(e, 'Güncelleme başarısız', 400);
  }
}

// DELETE /api/profile -> backend: DELETE /users/profile  (+ cookie temizliği)
export async function DELETE() {
  try {
    await deleteProfile();
  } catch (e) {
    return routeError(e, 'Hesap silinemedi', 400);
  }

  // Hesap silindikten sonra oturumu kapat
  const res = NextResponse.json({ ok: true });

  const expire = (name: string) =>
    res.cookies.set({
      name,
      value: '',
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(0),
    });

  expire('access');
  expire('refresh'); // varsa

  return res;
}
