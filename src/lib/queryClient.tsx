// src/lib/queryClient.tsx
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { traceEnabled } from '@/lib/trace';

const shouldLog = (key?: readonly unknown[]) =>
  traceEnabled() && Array.isArray(key) && key[0] === 'profile'; // isteğe bağlı filtre

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onSuccess: (_data, q) => { if (shouldLog(q.queryKey)) console.debug('[RQ] success', q.queryKey); },
    onError: (err, q) => {
      if (shouldLog(q.queryKey)) {
        const e = err as any;
        console.debug('[RQ] error', q.queryKey, e?.status, e?.traceId);
      }
    },
  }),
  mutationCache: new MutationCache({
    onSuccess: (_d, _vars, _ctx, m) => {
      if (traceEnabled()) console.debug('[RQ] mut success', m.options.mutationKey);
    },
    onError: (err, _vars, _ctx, m) => {
      if (traceEnabled()) {
        const e = err as any;
        console.debug('[RQ] mut error', m.options.mutationKey, e?.status, e?.traceId);
      }
    },
  }),
});
