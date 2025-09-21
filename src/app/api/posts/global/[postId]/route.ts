// src/app/api/news/global/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params;
    const data = await authFetchApi(
      `/admin/posts/global/${encodeURIComponent(postId)}`,
      { traceName: "route:/admin/posts/global/:postId#GET" }
    );
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Global haber detayı getirilemedi", 400);
  }
}
