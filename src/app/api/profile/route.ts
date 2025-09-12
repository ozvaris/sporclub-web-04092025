// src/app/api/profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';

// GET /api/profile  -> proxy: GET /admin/users/profile
export async function GET() {
  try {
    const data = await authFetchApi('/users/profile');
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Unauthorized' },
      { status: e?.status ?? 401 },
    );
  }
}

// PATCH /api/profile -> proxy: PATCH /admin/users/profile
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('profile-body', JSON.stringify(body));
    const data = await authFetchApi('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Güncelleme başarısız' },
      { status: e?.status ?? 400 },
    );
  }
}

// src/app/api/profile/route.ts

export async function DELETE() {
  // 1) Backend’de kendi hesabını sil
  try {
    await authFetchApi("/users/profile", {
      method: "DELETE",
      traceName: "auth:/users/profile#DELETE",
    });
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? "Hesap silinemedi" },
      { status: e?.status ?? 400 },
    );
  }

  // 2) Başarıyla silindikten sonra oturumu kapat (cookie’leri düşür)
  const res = NextResponse.json({ ok: true });

  const expire = (name: string) =>
    res.cookies.set({
      name,
      value: "",
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      expires: new Date(0),
    });

  expire("access");
  expire("refresh"); // varsa

  console.log("Hesap silindi, oturum kapatıldı");

  return res;
}

