// src/app/api/_lib/routeError.ts
import { NextResponse } from "next/server";
import { isApiError, apiErrorMessage } from "@/lib/fetchApi";

type ErrorBody = {
  error: string;
  code?: string;
  details?: unknown;
};

function pickStatus(e: unknown, fallback = 500) {
  if (isApiError(e)) {
    const pe = e.payload as any;
    return e.status ?? (typeof pe === "object" && pe?.statusCode) ?? fallback;
  }
  return (typeof (e as any)?.status === "number" && (e as any).status) || fallback;
}

export function routeError(e: unknown, fallbackMsg = "İşlem başarısız", defaultStatus = 500) {
  const status = pickStatus(e, defaultStatus);
  const body: ErrorBody = { error: apiErrorMessage(e, fallbackMsg) };

  // Prod’da iç sızıntı yok; dev’de hafif debug serbest
  if (process.env.NODE_ENV !== "production" && isApiError(e)) {
    body.details = (e as any).payload;
  }
  return NextResponse.json(body, { status });
}

// Try/catch’i ortadan kaldıran sarmalayıcı
export const withRouteError =
  <H extends (req: Request, ctx?: any) => Promise<Response>>(
    handler: H,
    opts?: { fallback?: string; defaultStatus?: number }
  ) =>
  async (req: Request, ctx?: any) => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      return routeError(e, opts?.fallback, opts?.defaultStatus ?? 500);
    }
  };
