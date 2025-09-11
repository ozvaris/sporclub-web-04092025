// src/app/api/profile/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';

// GET /api/profile  -> proxy: GET /admin/users/profile
export async function GET() {
  try {
    const data = await authFetchApi('/admin/users/profile');
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Unauthorized' },
      { status: e?.status ?? 401 },
    );
  }
}

// PUT /api/profile -> proxy: PUT /admin/users/profile
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await authFetchApi('/admin/users/profile', {
      method: 'PUT',
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

// DELETE /api/profile -> proxy: DELETE /admin/users/profile
export async function DELETE() {
  try {
    const data = await authFetchApi('/admin/users/profile', { method: 'DELETE' });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Silme işlemi başarısız' },
      { status: e?.status ?? 400 },
    );
  }
}
