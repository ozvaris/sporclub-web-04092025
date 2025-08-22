import { NextResponse } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';

export async function GET() {
  try {
    const data = await authFetchApi('/users/profile');
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Unauthorized' },
      { status: e?.status ?? 401 }
    );
  }
}
