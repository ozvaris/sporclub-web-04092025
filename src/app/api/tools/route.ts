// src/app/api/posts/club/[clubSlug]/[postId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { authFetchApi } from "@/lib/authFetchApi";
import { routeError } from "@/app/api/_lib/routeError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ clubSlug: string; postId: string }> }
) {
  try {
    // const { clubSlug, postId } = await params;
    // const data = await authFetchApi(
    //   `/admin/posts/club/${encodeURIComponent(clubSlug)}/${encodeURIComponent(postId)}`,
    //   { traceName: "route:/admin/posts/club/:clubSlug/:postId#GET" }
    // );
    const data = {test : "test"}
    return NextResponse.json(data);
  } catch (e) {
    return routeError(e, "Kulüp haber detayı getirilemedi", 400);
  }
}
