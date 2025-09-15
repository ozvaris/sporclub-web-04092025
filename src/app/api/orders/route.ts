import { NextResponse } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';
import { routeError } from '../_lib/routeError';

export async function GET() {
  try {
    const data = await authFetchApi('/orders');
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Unauthorized", 401);
  }
}
