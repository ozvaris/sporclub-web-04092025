import { NextResponse } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await authFetchApi(`/orders/${params.id}`);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { message: e?.message ?? 'Unauthorized' },
      { status: e?.status ?? 401 }
    );
  }
}
