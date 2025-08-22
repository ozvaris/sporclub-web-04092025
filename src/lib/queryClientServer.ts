// src/lib/queryClientServer.ts
import { QueryClient, QueryCache } from '@tanstack/react-query';
import { traceEnabled } from '@/lib/trace';
import { isApiError } from '@/lib/fetchApi';

export function QueryClientServer() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (err, q) => {
        // Yalnız izleme açıkken ( ?trace=1 / env ) logla
        if (!traceEnabled()) return;

        // Sadece ApiError ise (HTTP status/payload/traceId olan) logla
        if (isApiError(err)) {
          console.info('[RQ:SSR] error', q.queryKey, err.status, err.traceId);
        }
        // AbortError, redirect vb. durumları sessizce geç
      },
    }),
    defaultOptions: {
      queries: {
        retry: false, // SSR’da retry istemiyoruz
      },
    },
  });
}
