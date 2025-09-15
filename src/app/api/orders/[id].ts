import { NextResponse } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';
import { routeError } from '../_lib/routeError';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const data = await authFetchApi(`/orders/${params.id}`);
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Login failed", 401);
  }
}
