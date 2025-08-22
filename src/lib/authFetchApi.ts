import { cookies } from 'next/headers';
import { fetchApi, ApiError } from './fetchApi';

type FetchInit = RequestInit & { traceName?: string };

// Server Component API route'larında kullanılmak üzere
export async function authFetchApi(path: string, init?: FetchInit) {
  const access = (await cookies()).get('access')?.value;
  if (!access) {
    throw new ApiError(401, { message: "Unauthorized: no access cookie" });
  }

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
