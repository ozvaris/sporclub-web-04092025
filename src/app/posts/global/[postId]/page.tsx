// src/app/posts/global/[postId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import GenericPostsDetail from '@/components/posts/GenericPostsDetail';
import { QueryClientServer } from '@/lib/queryClientServer';
import { ApiError } from '@/lib/fetchApi';
import { PostScope, PostsType } from '@/features/posts/types';
import { getGlobalPostDetail, listGlobalPosts } from '@/server/services/posts';

type Params = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { postId } = await params;
  try {
    const a = await getGlobalPostDetail(postId);
    return {
      title: a?.title ?? 'Haber',
      description: a?.summary ?? undefined,
      openGraph: {
        title: a?.title ?? undefined,
        description: a?.summary ?? undefined,
        images: a?.cover ? [{ url: a.cover }] : a?.thumbnail ? [{ url: a.thumbnail }] : undefined,
      },
    };
  } catch {
    return { title: 'Haber', description: 'Global haber' };
  }
}

export default async function Page({ params }: Params) {
  const { postId } = await params;
  const qc = QueryClientServer();

  try {
    // 1) Detay (HTTP yok → direkt service)
    await qc.fetchQuery({
      queryKey: ['postsDetail', PostScope.GLOBAL, null, postId],
      queryFn: () => getGlobalPostDetail(postId),
      staleTime: 60_000,
    });

    // 2) İlgili (örnek: aynı tipten 6 adet; exclude mevcut post)
    await qc.fetchQuery({
      queryKey: ['postsRelated', PostScope.GLOBAL, null, postId],
      queryFn: () =>
        listGlobalPosts({
          type: PostsType.ARTICLE,
          exclude: postId,
          limit: 6,
        }),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) redirect(`/login?next=${encodeURIComponent(`/posts/global/${postId}`)}`);
    throw err;
  }

  const state = dehydrate(qc);

  return (
    <HydrationBoundary state={state}>
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <GenericPostsDetail scope={PostScope.GLOBAL} postIdOrSlug={postId} />
      </div>
    </HydrationBoundary>
  );
}
