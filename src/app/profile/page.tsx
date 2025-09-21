// src/app/profile/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfilePanel from '@/components/ProfilePanel';

import { cookies } from 'next/headers';
import { QueryClientServer } from '@/lib/queryClientServer';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from 'next/navigation';
import { ApiError } from '@/lib/fetchApi';
import { authFetchApi } from '@/lib/authFetchApi';

export const metadata = { title: 'Profil ve Ayarlar | Talenty' };

export default async function ProfilePage() {
  // const cookieStore = await cookies();
  // if (!cookieStore.get('access')?.value) {
  //   redirect(`/login?next=${encodeURIComponent('/profile')}`);
  // }

  const queryClientServer = QueryClientServer();
  try {
    await queryClientServer.prefetchQuery({
      queryKey: ['profile'],
      queryFn: () => authFetchApi('/api/profile', { traceName: 'ssr:/api/profile' }),
      staleTime: 5_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 401) {
      redirect(`/login?next=${encodeURIComponent('/profile')}`);
    }
    throw err;
  }

  const state = dehydrate(queryClientServer);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="container mx-auto max-w-screen-lg px-4 py-6 md:py-10">
        <div className="mb-6 md:mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold">Hesabım</h1>
          <p className="text-gray-600 mt-2">Bilgilerinizi görüntüleyin, güncelleyin ve güvenlik ayarlarınızı yönetin.</p>
        </div>
        <ProfilePanel />
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
