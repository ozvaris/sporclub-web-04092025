// src/app/clubs/[slug]/admin/page.tsx
// SSR guard: login yoksa /login?next=...; kulüp, haber ve oyuncular prefetch
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ClubAdminPanel from "@/components/ClubAdminPanel";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { QueryClientServer } from "@/lib/queryClientServer";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { authFetchApi } from "@/lib/authFetchApi";
import { ApiError } from "@/lib/fetchApi";

export const metadata = { title: "Kulüp Yönetim Paneli | Talenty" };

type PageParams = { slug: string };

export default async function ClubAdminPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;

  const qc = QueryClientServer();

  try {
    // SSR prefetch – Next BFF /api route’larını kullanıyoruz
    await qc.prefetchQuery({
      queryKey: ["club", slug],
      queryFn: () =>
        authFetchApi(`/api/clubs/${slug}`, {
          traceName: "ssr:/api/clubs/:slug",
        }),
      staleTime: 60_000,
    });

    await qc.prefetchQuery({
      queryKey: ["clubNews", slug],
      queryFn: () =>
        authFetchApi(`/api/clubs/${slug}/posts`, {
          traceName: "ssr:/api/clubs/:slug/posts",
        }),
      staleTime: 60_000,
    });

    await qc.prefetchQuery({
      queryKey: ["clubPlayers", slug],
      queryFn: () =>
        authFetchApi(`/api/clubs/${slug}/players`, {
          traceName: "ssr:/api/clubs/:slug/players",
        }),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/posts/club/${slug}`)}`);
    }
    throw err;
  }

  const state = dehydrate(qc);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="bg-[#e0e6ed]">
        {/* 'container' yerine kontrollü merkezleme: tam ortalama ve referans paddings */}
        <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-6 md:py-10">
          <ClubAdminPanel slug={slug} />
        </div>
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
