// src/app/api/news/global/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(req: NextRequest) {
  try {
    const sp = new URL(req.url).searchParams;

    const qs = new URLSearchParams();
    for (const key of ["type", "exclude", "limit", "page", "tags", "categories"]) {
      const v = sp.get(key);
      if (v) qs.set(key, v);
    }

    const path = `/admin/posts/global` + (qs.toString() ? `?${qs.toString()}` : "");

    const data = await authFetchApi(path, {
      traceName: "route:/admin/posts/global#GET",
    });

    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Global haberler yüklenemedi", 400);
  }
}
