// src/lib/trace.ts
export type TraceMeta = {
  id: string;
  from: "server" | "client";
  name?: string;
  start: number;
};

export function traceEnabled(): boolean {
  // Browser: ?trace=1 veya localStorage bayrağı
  if (typeof window !== "undefined") {
    const url = new URL(window.location.href);
    const q = url.searchParams.get("trace");
    if (q === "1") localStorage.setItem("__trace", "1");
    if (q === "0") localStorage.removeItem("__trace");
    return localStorage.getItem("__trace") === "1" || process.env.NEXT_PUBLIC_DEBUG_TRACE === "1";
  }
  // Server: env bayrağı
  return process.env.DEBUG_TRACE === "1" || process.env.NEXT_PUBLIC_DEBUG_TRACE === "1";
}

export function startTrace(name?: string): TraceMeta {
  const id = (globalThis.crypto ?? require("node:crypto")).randomUUID();
  const from = typeof window === "undefined" ? "server" : "client";
  return { id, from, name, start: performance.now() };
}

export function stampHeaders(h: HeadersInit | undefined, t: TraceMeta): HeadersInit {
  const hdr = new Headers(h);
  hdr.set("x-trace-id", t.id);
  hdr.set("x-trace-src", t.from);
  if (t.name) hdr.set("x-trace-name", t.name);
  return hdr;
}

export function endTrace(t: TraceMeta, res?: Response, extra?: Record<string, unknown>) {
  const dur = Math.round(performance.now() - t.start);
  const line = `[TRACE] ${t.from} ${t.name ?? ""} id=${t.id} dur=${dur}ms${res ? ` status=${res.status}` : ""}`;
  if (typeof window === "undefined") console.info(line, extra ?? {});
  else console.debug(line, extra ?? {});
}
