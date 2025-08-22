import { useQuery } from '@tanstack/react-query';
import { fetchApi, ApiError } from '@/lib/fetchApi';

// Tek kapı: Next route'unu çağırıyoruz (fetchApi içinde tracing zaten var)
export async function fetchProfile() {
  try {
    return await fetchApi<any>('/api/profile', { traceName: 'client:/api/profile' });
  } catch (e) {
    const err = e as ApiError;

    if (err.status === 401) {
      // Sessiz yenileme dene
      try {
        await fetchApi('/api/refresh', { method: 'POST', traceName: 'client:/users/refresh' });
        // başarıysa tekrar dene
        return await fetchApi<any>('/api/profile', { traceName: 'client:/api/profile:retry' });
      } catch {
        // refresh de olmadı → 401'i yukarı fırlat
        throw err;
      }
    }
    throw err;
  }
}

export function useProfileQuery() {

  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,       // <— artık tanımlı
    staleTime: 60_000,
    retry: false,                // 401 akışını kendimiz yönettik; ekstra retry istemiyoruz
  });
}
