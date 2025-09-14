// /src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { fetchApi } from '@/lib/fetchApi';

export async function POST(req: Request) {
  const body = await req.json();
  try {
    const data = await fetchApi('/admin/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      traceName: 'route:/api/register',
    });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Register failed' }, { status: e?.status ?? 400 });
  }
}
