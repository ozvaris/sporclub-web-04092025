// src/app/api/clubs/[slug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const data = await authFetchApi(`/admin/clubs/${params.slug}`, {
      traceName: "route:/admin/clubs/:slug#GET",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Kulüp bilgisi getirilemedi", 400);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const data = await authFetchApi(`/admin/clubs/${params.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      traceName: "route:/admin/clubs/:slug#PATCH",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Kulüp güncelleme başarısız", 400);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await authFetchApi(`/admin/clubs/${params.slug}`, {
      method: "DELETE",
      traceName: "route:/admin/clubs/:slug#DELETE",
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return routeError(e, "Kulüp silme başarısız", 400);
  }
}
