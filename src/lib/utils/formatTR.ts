export function formatTR(v?: string | Date | null) {
  if (!v) return "";
  const d = typeof v === "string" ? new Date(v) : v;
  return isNaN(d as any) ? "" : d.toLocaleDateString("tr-TR");
}