// src/app/posts/athlete/[athleteSlug]/[postId]/page.tsx
import { notFound, redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import GenericPostsDetail from '@/components/posts/GenericPostsDetail';
import { QueryClientServer } from '@/lib/queryClientServer';
import { ApiError } from '@/lib/fetchApi';
import { PostScope, PostsType } from '@/features/posts/types';
import { getAthletePostDetail, listAthletePosts } from '@/server/services/posts';

type Params = { params: Promise<{ athleteSlug: string; postId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { athleteSlug, postId } = await params;
  try {
    const a = await getAthletePostDetail(athleteSlug, postId);
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
    return { title: 'Haber', description: 'Sporcu haberi' };
  }
}

export default async function Page({ params }: Params) {
  const { athleteSlug, postId } = await params;
  const qc = QueryClientServer();

  try {
    // 1) Detay (HTTP yok → direkt service)
    await qc.fetchQuery({
      queryKey: ['postsDetail', PostScope.ATHLETE, athleteSlug, postId],
      queryFn: () => getAthletePostDetail(athleteSlug, postId),
      staleTime: 60_000,
    });

    // 2) İlgili (örnek: aynı tipten 6 adet; mevcut post hariç)
    await qc.fetchQuery({
      queryKey: ['postsRelated', PostScope.ATHLETE, athleteSlug, postId],
      queryFn: () =>
        listAthletePosts(athleteSlug, {
          type: PostsType.ARTICLE,
          exclude: postId,
          limit: 6,
        }),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/posts/athlete/${athleteSlug}/${postId}`)}`);
    }
    throw err;
  }

  const state = dehydrate(qc);

  return (
    <HydrationBoundary state={state}>
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <GenericPostsDetail
          scope={PostScope.ATHLETE}
          ownerSlug={athleteSlug}
          postIdOrSlug={postId}
        />
      </div>
    </HydrationBoundary>
  );
}
