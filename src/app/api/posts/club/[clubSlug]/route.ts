// src/app/api/posts/club/[clubSlug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ clubSlug: string }> }
) {
  try {
    const { clubSlug } = await params;
    const sp = new URL(req.url).searchParams;

    // forward edilen filtreler
    const qs = new URLSearchParams();
    for (const key of ["type", "exclude", "limit", "page", "tags", "categories"]) {
      const v = sp.get(key);
      if (v) qs.set(key, v);
    }

    const path =
      `/admin/posts/club/${encodeURIComponent(clubSlug)}` +
      (qs.toString() ? `?${qs.toString()}` : "");

    const data = await authFetchApi(path, {
      traceName: "route:/admin/posts/club/:clubSlug#GET",
    });

    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Kulüp haberleri yüklenemedi", 400);
  }
}
