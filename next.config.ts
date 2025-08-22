// next.config.ts
import type { NextConfig } from "next";

// RemotePattern’ın şekli (iç tipleri import etmeden)
type RP = {
  protocol?: "http" | "https";
  hostname: string;
  port?: string;
  pathname?: string;
  search?: string;
};

const cdnHost = process.env.NEXT_PUBLIC_CDN_HOSTNAME;

const remotePatterns: RP[] = [
  // geliştirirken localhost’tan gelen görseller
  { protocol: "http", hostname: "localhost"},
  { protocol: "http", hostname: "127.0.0.1"},
];

// prod’da CDN kullanıyorsan koşullu ekle
if (cdnHost) {
  remotePatterns.push({ protocol: "https", hostname: cdnHost });
  // gerekiyorsa pathname/port da ver:
  // remotePatterns.push({ protocol: "https", hostname: cdnHost, pathname: "/**" });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  // rewrites yok — fetch’i route handler veya fetchApi ile yönetiyoruz
};

export default nextConfig;


