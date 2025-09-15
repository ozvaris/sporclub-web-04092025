// src/app/api/_lib/routeMessages.ts
export type Locale = "en" | "tr";

export const ROUTE_MESSAGES = {
  // AUTH
  "auth.login_failed":   { en: "Login failed",            tr: "Giriş başarısız" },
  "auth.unauthorized":   { en: "Unauthorized",            tr: "Yetkisiz erişim" },
  "auth.forbidden":      { en: "Forbidden",               tr: "Erişim engellendi" },
  "auth.refresh_failed": { en: "Refresh failed",          tr: "Oturum yenileme başarısız" },

  // COMMON
  "common.unexpected":   { en: "Unexpected error",        tr: "Beklenmeyen bir hata oluştu" },
  "common.not_found":    { en: "Not found",               tr: "Bulunamadı" },
  "common.invalid_input":{ en: "Invalid input",           tr: "Geçersiz girdi" },
} as const;

export type RouteMessageKey = keyof typeof ROUTE_MESSAGES;

export function getRouteMessage(key: RouteMessageKey, locale: Locale = "en"): string {
  const bundle = ROUTE_MESSAGES[key];
  return (bundle?.[locale] ?? bundle?.en) ?? "Unexpected error";
}

export function inferLocaleFromRequest(req?: Request): Locale {
  const h = req?.headers?.get("accept-language")?.toLowerCase() ?? "";
  return h.startsWith("tr") ? "tr" : "en";
}
