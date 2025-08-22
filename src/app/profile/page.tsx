// src/app/profile/page.tsx
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfilePanel from '@/components/ProfilePanel';
import { fetchProfile } from '@/features/auth/useProfileQuery';

import { cookies } from 'next/headers';
import { QueryClientServer } from '@/lib/queryClientServer';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { redirect } from "next/navigation";
import {  ApiError } from "@/lib/fetchApi";
import { authFetchApi } from '@/lib/authFetchApi';

export const metadata = { title: 'Profile | Talenty' };


export default async function ProfilePage() {
  const cookieStore = await cookies();
  if (!cookieStore.get("access")?.value) {
    redirect(`/login?next=${encodeURIComponent("/profile")}`);
  }

  const queryClientServer = QueryClientServer();
  try {
    await queryClientServer.prefetchQuery({
      queryKey: ["profile"],
      queryFn: () => authFetchApi("/api/profile", { traceName: "ssr:/api/profile" }),
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 401) {
      redirect(`/login?next=${encodeURIComponent("/profile")}`);
    }
    throw err; // 5xx vb. için global error'a bırakalım
  }

    const state = dehydrate(queryClientServer);

    return (
        <HydrationBoundary state={state}>
            <Header />
            <main className="container max-w-screen-md mx-auto py-8">
                <h1 className="text-2xl font-bold mb-4">Profil</h1>
                <ProfilePanel />
            </main>
            <Footer />
        </HydrationBoundary>
    );
}
