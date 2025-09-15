// src/app/clubs/[slug]/admin/page.tsx
// SSR guard: login yoksa /login?next=...; kulüp, haber ve oyuncular prefetch
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubAdminPanel from "@/components/ClubAdminPanel";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { QueryClientServer } from "@/lib/queryClientServer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { authFetchApi } from "@/lib/authFetchApi";

export const metadata = { title: "Kulüp Yönetim Paneli | Talenty" };

type PageParams = { slug: string };

export default async function ClubAdminPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;

  const cookieStore = await cookies();
  if (!cookieStore.get("access")?.value) {
    redirect(`/login?next=${encodeURIComponent(`/clubs/${slug}/admin`)}`);
  }

  const qc = QueryClientServer();

  // SSR prefetch – Next BFF /api route’larını kullanıyoruz
  await qc.prefetchQuery({
    queryKey: ["club", slug],
    queryFn: () => authFetchApi(`/api/clubs/${slug}`, { traceName: "ssr:/api/clubs/:slug" }),
    staleTime: 60_000,
  });

  await qc.prefetchQuery({
    queryKey: ["clubNews", slug],
    queryFn: () => authFetchApi(`/api/clubs/${slug}/news`, { traceName: "ssr:/api/clubs/:slug/news" }),
    staleTime: 60_000,
  });

  await qc.prefetchQuery({
    queryKey: ["clubPlayers", slug],
    queryFn: () => authFetchApi(`/api/clubs/${slug}/players`, { traceName: "ssr:/api/clubs/:slug/players" }),
    staleTime: 60_000,
  });

  const state = dehydrate(qc);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="container mx-auto max-w-screen-xl px-4 md:px-6 py-6 md:py-10">
        <ClubAdminPanel slug={slug} />
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
