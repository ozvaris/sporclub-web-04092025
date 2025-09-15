import { NextResponse, NextRequest } from 'next/server';
import { authFetchApi } from '@/lib/authFetchApi';
import { routeError } from '../../_lib/routeError';

// POST /api/profile/password -> proxy: POST /users/profile/password
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('password-body', JSON.stringify(body));
    const data = await authFetchApi('/users/profile/password', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Parola güncellenemedi", 401);
  }
}