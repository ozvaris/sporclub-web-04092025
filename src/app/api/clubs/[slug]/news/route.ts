// src/app/api/clubs/[slug]/news/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const data = await authFetchApi(`/admin/clubs/${slug}/news`, {
      traceName: "route:/admin/clubs/:slug/news#GET",
    });
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Haberler yüklenemedi", 400);
  }
}
