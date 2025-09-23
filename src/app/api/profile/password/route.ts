// src/app/api/profile/password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { routeError } from '../../_lib/routeError';
import { changePassword, type ChangePasswordInput } from '@/server/services/profile';

// POST /api/profile/password -> backend: POST /users/profile/password
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChangePasswordInput;
    const data = await changePassword(body);
    // Mevcut route’unuz POST ile proxy yapıyordu, aynı davranış korunuyor
    // :contentReference[oaicite:2]{index=2}
    return NextResponse.json(data);
  } catch (e) {
    // Önceki mesaj: "Parola güncellenemedi"
    // :contentReference[oaicite:3]{index=3}
    return routeError(e, 'Parola güncellenemedi', 401);
  }
}
