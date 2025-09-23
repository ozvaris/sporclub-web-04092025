// src/lib/authFetchApi.ts
import { cookies } from 'next/headers';
import { fetchApi, ApiError } from './fetchApi';

type FetchInit = RequestInit & { traceName?: string };

// Server Component API route'larında kullanılmak üzere
export async function authFetchApi<T>(path: string, init?: FetchInit): Promise<T> {
  const access = (await cookies()).get('access')?.value;
  const refresh = (await cookies()).get('refresh')?.value;
  if (!access && !refresh) {
    throw new ApiError(401, { message: "Unauthorized: no access cookie" });
  }

  console.log(`authFetchApi access:${access?true:false} refresh:${refresh?true:false} path:${path}` )

  return fetchApi(path, {
    ...init,
     // ⬇️ traceName yalnız debug açıkken anlamlıdır; normalde sıfır maliyet
    traceName: init?.traceName ?? `auth:${path}`,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${access}`,
    },
  });
}
