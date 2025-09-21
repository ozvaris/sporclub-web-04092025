// src/app/posts/global/[postId]/page.tsx
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import GenericPostsDetail from "@/components/posts/GenericPostsDetail";
import { QueryClientServer } from '@/lib/queryClientServer';
import { authFetchApi } from "@/lib/authFetchApi";
import { ApiError } from '@/lib/fetchApi';
import { PostScope, PostsType, type PostArticle } from "@/features/posts/types";

type Params = { params: Promise<{ postId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { postId } = await params;
  try {
    const a = await authFetchApi<PostArticle>(
      `/api/posts/global/${postId}`,
      { traceName: "ssr:/api/posts/global/:postId#GET:meta" }
    );
    return {
      title: a?.title ?? "Haber",
      description: a?.summary ?? undefined,
      openGraph: {
        title: a?.title ?? undefined,
        description: a?.summary ?? undefined,
        images: a?.cover ? [{ url: a.cover }] : a?.thumbnail ? [{ url: a.thumbnail }] : undefined,
      },
    };
  } catch {
    return { title: "Haber", description: "Genel haber" };
  }
}

export default async function Page({ params }: Params) {
  const { postId } = await params;

  const queryClientServer = QueryClientServer();

  try {
    await queryClientServer.prefetchQuery({
      queryKey: ["postsDetail", PostScope.GLOBAL, null, postId],
      queryFn: () =>
        authFetchApi<PostArticle>(
          `/api/posts/global/${postId}`,
          { traceName: "ssr:/api/posts/global/:postId#GET" }
        ),
      staleTime: 60_000,
    });

    await queryClientServer.prefetchQuery({
      queryKey: ["postsRelated", PostScope.GLOBAL, null, postId],
      queryFn: () =>
        authFetchApi<PostArticle[]>(
          `/api/posts/global?type=${PostsType.ARTICLE}&exclude=${encodeURIComponent(
            postId
          )}&limit=6`,
          { traceName: "ssr:/api/posts/global#GET:related" }
        ),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) {
      redirect(`/login?next=${encodeURIComponent(`/posts/global/${postId}`)}`);
    }
    throw err;
  }

  const state = dehydrate(queryClientServer);

  return (
    <HydrationBoundary state={state}>
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <GenericPostsDetail scope={PostScope.GLOBAL} postIdOrSlug={postId} />
      </div>
    </HydrationBoundary>
  );
}
