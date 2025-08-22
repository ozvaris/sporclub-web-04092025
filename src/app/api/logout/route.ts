import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { fetchApi } from '@/lib/fetchApi';

const COOKIE_OPTIONS = { httpOnly: true, sameSite: 'lax' as const, path: '/' };

export async function POST() {
  try {
    // Mevcut çerezleri oku (varsa backend’e ilet)
    const jar = await cookies();
    const cookieHeader = jar.toString();

    // Opsiyonel: backend oturumunu da kapat (refresh token'ı invalid etmesi iyi olur)
    try {
      await fetchApi('/auth/logout', { method: 'POST', headers: { Cookie: cookieHeader }, traceName: "route:/api/logout", });
    } catch { /* backend logout başarısızsa da local çerezleri sileceğiz */ }

  } finally {
    // ✅ Hem access hem de muhtemel refresh cookie’lerini temizle
    const res = NextResponse.json({ ok: true });

    // en sık adlar:
    res.cookies.set('access', '', { ...COOKIE_OPTIONS, maxAge: 0 });
    res.cookies.set('refresh', '', { ...COOKIE_OPTIONS, maxAge: 0 });
    
    return res;
  }
}
