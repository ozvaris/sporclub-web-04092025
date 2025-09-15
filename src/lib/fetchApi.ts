// src/lib/fetchApi.ts
import { endTrace, stampHeaders, startTrace, traceEnabled } from './trace';

// init'e "traceName" opsiyonunu ekledik (geri uyumlu)
type FetchInit = RequestInit & { traceName?: string };

// Backend'in dönebileceği en yaygın hata gövdesi
export type ApiErrorPayload = {
  error?: string;
  message?: string;
  statusCode?: number;
  [k: string]: unknown;
} | null;

export class ApiError extends Error {
  constructor(
    public status: number,
    public payload: ApiErrorPayload = null,  // <-- unknown değil
    public traceId?: string,
    public url?: string,
  ) {
    super(`API ${status} Error${payload && typeof payload === "object" && "message" in payload ? `: ${(payload as any).message}` : ""}`);
    this.name = "ApiError";
  }
}

// Kolay tip koruyucu
export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError ||
    (typeof e === "object" && e !== null && "status" in e && "payload" in e);
}

// UI'da tek satırda insan-okur mesaj üret
export function apiErrorMessage(e: unknown, fallback = "Bir hata oluştu"): string {
  if (isApiError(e)) {
    const p = e.payload || {};
    return (
      (typeof p === "object" && (p as any).error) ||
      (typeof p === "object" && (p as any).message) ||
      e.message ||
      `HTTP ${e.status}` ||
      fallback
    ) as string;
  }
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

function resolveUrl(path: string) {
  // mutlak URL verilmişse dokunma
  try { return new URL(path).toString(); } catch {}

  // 2) Next'in kendi route'ları: /api/* -> asla base ekleme
  if (path.startsWith("/api/")) {
    return path; // => app/api/**/route.ts handler'ına gider
  }

  // 3) Geri kalanlar: backend origin'i uygula (senin env'ine göre adı değişebilir)

  // server: BACKEND_URL; client: NEXT_PUBLIC_API_BASE_URL
  const base =
    typeof window === 'undefined'
      ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '')
      : (process.env.NEXT_PUBLIC_API_BASE_URL || '');

  return base ? new URL(path, base).toString() : path; // base yoksa olduğu gibi kullan
}

export async function fetchApi<T>(path: string, init?: FetchInit): Promise<T> {

  const url = resolveUrl(path);

  const tracing = traceEnabled();
  const trace = tracing ? startTrace(init?.traceName ?? path) : null;


  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  };

  const res = await fetch(url, {
    ...init,
    headers: trace ? stampHeaders(headers, trace) : headers,
  });

  // console.log(`fetchApi ${res.status} ${url}`);

  // 401'de client tarafta /api/* çağrısıysa otomatik refresh dene
  if (res.status === 401) {
    const isNextApi = typeof path === "string" && path.startsWith("/api/");
    const isLoginOrRefresh =
      typeof path === "string" &&
      (path.startsWith("/api/login") || path.startsWith("/api/refresh"));

    if (isNextApi && !isLoginOrRefresh) {
      try {
        await fetch("/api/refresh", { method: "POST", cache: "no-store" });
        // tek seferlik yeniden dene
        const retry = await fetch(url, {
          ...init,
          headers: trace ? stampHeaders(headers, trace) : headers,
        });
        if (retry.ok) {
          if (trace) endTrace(trace, retry, { url, retried: true });
          return retry.json() as Promise<any>;
        }
        // retry da 401/403 ise normal hata akışına düş
        return Promise.reject(retry);
      } catch {
        // refresh kendi hatasına düşerse aşağıdaki genel hata akışına devam
      }
    }
  }

  if (!res.ok) {
    let payload: ApiErrorPayload = null;
    try { payload = await res.json(); } catch {}
    if (trace) endTrace(trace, res, { url, payload });
    throw new ApiError(res.status, payload, trace?.id, url);
  }

  if (trace) {
    // Sunucu Server-Timing gönderdiyse bunu da loglamak istersek:
    const st = res.headers.get('server-timing') || undefined;
    endTrace(trace, res, st ? { url, serverTiming: st } : { url });
  }

  return res.json() as Promise<T>;
  
}
