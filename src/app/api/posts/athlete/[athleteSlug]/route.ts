// src/app/api/news/athlete/[athleteSlug]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ athleteSlug: string }> }
) {
  try {
    const { athleteSlug } = await params;
    const sp = new URL(req.url).searchParams;

    const qs = new URLSearchParams();
    for (const key of ["type", "exclude", "limit", "page", "tags", "categories"]) {
      const v = sp.get(key);
      if (v) qs.set(key, v);
    }

    const path =
      `/admin/posts/athlete/${encodeURIComponent(athleteSlug)}` +
      (qs.toString() ? `?${qs.toString()}` : "");

    const data = await authFetchApi(path, {
      traceName: "route:/admin/posts/athlete/:athleteSlug#GET",
    });

    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Atlet haberleri yüklenemedi", 400);
  }
}
