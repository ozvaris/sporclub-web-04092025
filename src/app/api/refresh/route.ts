// src/app/api/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fetchApi } from "@/lib/fetchApi";
import { routeError } from "../_lib/routeError";

type RefreshResp = {
  access_token: string;
  access_expires_in?: number;   // saniye
  refresh_token?: string;
  refresh_expires_in?: number;  // saniye
};

export async function POST() {
  try {
    const jar = await cookies();        // mevcut cookie'lerimiz
    const refresh = jar.get("refresh")?.value; // refresh token'ı al

    if (!refresh) {
      const res = NextResponse.json({ error: "No refresh token" }, { status: 401 });
      res.cookies.set("access", "", { maxAge: 0, path: "/" });
      res.cookies.set("refresh", "", { maxAge: 0, path: "/" });
      return res;
    }

    
    // Backend JWT header istemiyor; gövdeye refresh_token gönderiyoruz.
    // fetchApi tarafında default Authorization ekliyorsa, 'Authorization': '' ile override ediyoruz.
    const data = await fetchApi<RefreshResp>("/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "", // önemli: otomatik Bearer eklenmesini engeller
      },
      body: JSON.stringify({ refresh_token: refresh }),
      cache: "no-store",
      traceName: "route:/api/refresh",
    });

    const res = NextResponse.json({ ok: true });

    const base = {
      httpOnly: true as const,
      sameSite: "lax" as const,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    // access güncelle
    {
      const maxAge =
        Number.isFinite(data.access_expires_in) && (data.access_expires_in as number) > 0
          ? (data.access_expires_in as number)
          : 60 * 15; // fallback: 15 dk
      res.cookies.set("access", data.access_token, { ...base, maxAge });
    }

    // rotating refresh geldiyse güncelle
    if (data.refresh_token) {
      const maxAge =
        Number.isFinite(data.refresh_expires_in) && (data.refresh_expires_in as number) > 0
          ? (data.refresh_expires_in as number)
          : 60 * 60 * 24 * 7; // fallback: 7 gün
      res.cookies.set("refresh", data.refresh_token, { ...base, maxAge });
    }

    return res;

  } catch (e) {
    const res = routeError(e, "Refresh failed", 401);
    res.cookies.set("access", "",  { maxAge: 0, path: "/" });
    res.cookies.set("refresh","",  { maxAge: 0, path: "/" });
    return res;
  }
}
