// src/app/clubs/[slug]/admin/page.tsx
// SSR (RSC) → doğrudan service çağırır (HTTP yok). Client → /api ile çalışmaya devam eder.
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ClubAdminPanel from '@/components/ClubAdminPanel';

import { notFound, redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { QueryClientServer } from '@/lib/queryClientServer';
import { ApiError } from '@/lib/fetchApi';

import { getClub, listClubPlayers, listClubPosts } from '@/server/services/clubs';

export const metadata = { title: 'Kulüp Yönetim Paneli | Talenty' };

type PageParams = { slug: string };

export default async function ClubAdminPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const qc = QueryClientServer();

  try {
    // 1) Kulüp bilgisi
    await qc.fetchQuery({
      queryKey: ['club', slug],
      queryFn: () => getClub(slug),
      staleTime: 60_000,
    });

    // 2) Kulüp haberleri
    await qc.fetchQuery({
      queryKey: ['clubPosts', slug],
      queryFn: () => listClubPosts(slug),
      staleTime: 60_000,
    });

    // 3) Kulüp oyuncuları
    await qc.fetchQuery({
      queryKey: ['clubPlayers', slug],
      queryFn: () => listClubPlayers(slug),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) {
      // Admin sayfası olduğu için next=clubs/..../admin
      redirect(`/login?next=${encodeURIComponent(`/clubs/${slug}/admin`)}`);
    }
    throw err;
  }

  const state = dehydrate(qc);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="bg-[#e0e6ed]">
        <div className="mx-auto max-w-screen-xl px-4 md:px-6 py-6 md:py-10">
          <ClubAdminPanel slug={slug} />
        </div>
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
