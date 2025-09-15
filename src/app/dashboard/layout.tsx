// src/app/dashboard/layout.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cookies } from 'next/headers';
import { QueryClientServer } from '@/lib/queryClientServer';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';

export const metadata = { title: 'Dashboard | Talenty' };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Bearer token'ı cookie'den al
  const access = (await cookies()).get('access')?.value;

  const queryClientServer = QueryClientServer();

  // Profil bilgisini sunucuda önden getir → client'ta anında hazır
  await queryClientServer.prefetchQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch(process.env.BACKEND_URL + '/admin/users/profile', {
        headers: access ? { Authorization: `Bearer ${access}` } : {},
        // istersen next: { revalidate: 0 } ekleyebilirsin
      });
      if (!res.ok) throw new Error('Unauthorized');
      return res.json();
    },
  });

  const state = dehydrate(queryClientServer);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="container mx-auto py-6 min-h-[60vh]">{children}</main>
      <Footer />
    </HydrationBoundary>
  );
}
