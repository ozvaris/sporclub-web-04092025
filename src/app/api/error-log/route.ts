// src/app/api/error-log/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json().catch(() => ({}));
    // Prod’da gerçek bir log servisine gönderebilirsiniz
    console.error('[client-error]', payload);
  } catch {}
  return new NextResponse(null, { status: 204 });
}
