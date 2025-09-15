// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import { fetchApi, ApiError } from "@/lib/fetchApi";
import { routeError } from "../_lib/routeError";

type LoginResp = {
  access_token: string;
  access_expires_in?: number;   // saniye
  refresh_token?: string;
  refresh_expires_in?: number;  // saniye
};

export async function POST(req: Request) {
  const body = await req.json(); // { email, password }

  try {
    const data = await fetchApi<LoginResp>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      traceName: "route:/auth/login",
    });

    const res = NextResponse.json({ ok: true });

    // access cookie
    if (data.access_token) {
      const maxAge =
        Number.isFinite(data.access_expires_in) && (data.access_expires_in as number) > 0
          ? (data.access_expires_in as number)
          : 60 * 15; // fallback 15 dk
      res.cookies.set("access", data.access_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: maxAge, // 15 dk
      });
    }

    // refresh cookie (rotating ise backend yeni refresh da döndürebilir)
    if (data.refresh_token) {
      const maxAge =
        Number.isFinite(data.refresh_expires_in) && (data.refresh_expires_in as number) > 0
          ? (data.refresh_expires_in as number)
          : 60 * 60 * 24 * 7; // fallback 7 gün
          
      res.cookies.set("refresh", data.refresh_token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        // refresh tipik olarak günler/haftalar: örn. 7 gün
        maxAge: maxAge, // 7 gün
      });
    }

    return res;
  } catch (e) {
    return routeError(e, "Login failed", 401);
  }
}
