// src/app/profile/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfilePanel from '@/components/ProfilePanel';

import { notFound, redirect } from 'next/navigation';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { QueryClientServer } from '@/lib/queryClientServer';
import { ApiError } from '@/lib/fetchApi';
import { getProfile } from '@/server/services/profile';

export const metadata = { title: 'Profil ve Ayarlar | Talenty' };

export default async function ProfilePage() {
  // SSR (RSC): /api’ya fetch ATMADAN doğrudan server-only service kullan
  const qc = QueryClientServer();

  try {
    await qc.fetchQuery({
      queryKey: ['profile'],
      queryFn: () => getProfile(),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) {
      redirect(`/login?next=${encodeURIComponent('/profile')}`);
    }
    throw err;
  }

  const state = dehydrate(qc);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="container mx-auto max-w-screen-lg px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Hesabım</h1>
          <p className="text-gray-600 mt-2">
            Bilgilerinizi görüntüleyin, güncelleyin ve güvenlik ayarlarınızı yönetin.
          </p>
        </div>
        <ProfilePanel />
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
