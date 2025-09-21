// src/app/api/news/athlete/[athleteSlug]/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ athleteSlug: string; postId: string }> }
) {
  try {
    const { athleteSlug, postId } = await params;
    const data = await authFetchApi(
      `/admin/posts/athlete/${encodeURIComponent(athleteSlug)}/${encodeURIComponent(postId)}`,
      { traceName: "route:/admin/posts/athlete/:athleteSlug/:postId#GET" }
    );
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Atlet haber detayı getirilemedi", 400);
  }
}
