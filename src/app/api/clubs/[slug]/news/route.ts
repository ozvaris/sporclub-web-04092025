// src/app/api/clubs/[slug]/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const data = await authFetchApi(`/admin/clubs/${params.slug}/news`, {
      traceName: "route:/admin/clubs/:slug/news#GET",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Haberler yüklenemedi", 400);
  }
}
