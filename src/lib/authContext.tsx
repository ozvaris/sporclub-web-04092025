// src/lib/authContext.tsx
'use client';

import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/types';
import { queryClient } from './queryClient';
import { useRouter } from 'next/navigation';
import { useProfileQuery } from '@/features/auth/useProfileQuery';
import { fetchApi } from './fetchApi';

type AuthCtxT = {
  user: User | null;
  loading: boolean;
  logout(): void;
};

const AuthCtx = createContext<AuthCtxT>({
  user: null,
  loading: false,
  logout() {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  // Not: queryFn / onError gibi detaylar queryClient.setQueryDefaults(['profile'], ...) içinde
  const { data, status, isFetching } = useProfileQuery();

  const user = data ?? null;
  const loading = status === 'pending' || (isFetching && !data);

  const logout = async () => {
    await fetchApi("/api/logout", {
      method: "POST",
      cache: "no-store",
      traceName: "client:/api/logout",
    }).catch(() => { /* logout telafisi için hata yutulabilir */ });

    // ✅ Tüm query cache’i temizle (veya en azından profile’ı sıfırla)
    queryClient.setQueryData(['profile'], null);
    queryClient.removeQueries({ queryKey: ["profile"], exact: true });
    // Alternatif/ekstra: queryClient.clear();

    router.replace('/');
  };

  return (
    <AuthCtx.Provider value={{ user, loading, logout }}>
      {/* İnce progress şeridi – minimal, layout shift yapmaz */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 h-0.5 bg-primary/70 animate-pulse z-[9999]" />
      )}
      {children}
    </AuthCtx.Provider>
  );
};

export const useAuth = () => useContext(AuthCtx);
