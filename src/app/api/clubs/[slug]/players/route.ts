// src/app/api/clubs/[slug]/players/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const data = await authFetchApi(`/admin/clubs/${params.slug}/players`, {
      traceName: "route:/admin/clubs/:slug/players#GET",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Oyuncular yüklenemedi", 400);
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const data = await authFetchApi(`/admin/clubs/${params.slug}/players`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      traceName: "route:/admin/clubs/:slug/players#POST",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Oyuncu eklenemedi", 400);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json(); // { id, defense?, offense? }
    const data = await authFetchApi(`/admin/clubs/${params.slug}/players`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      traceName: "route:/admin/clubs/:slug/players#PATCH",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Oyuncu güncellenemedi", 400);
  }
}
