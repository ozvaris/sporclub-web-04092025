// src/app/posts/club/[clubSlug]/[postId]/page.tsx
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import GenericPostsDetail from "@/components/posts/GenericPostsDetail";
import { QueryClientServer } from "@/lib/queryClientServer";
import { authFetchApi } from "@/lib/authFetchApi";
import { ApiError } from "@/lib/fetchApi";
import { PostScope, PostsType, type PostArticle } from "@/features/posts/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Params = { params: Promise<{ clubSlug: string; postId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { clubSlug, postId } = await params;
  try {
    const a = await authFetchApi<PostArticle>(
      `/api/posts/club/${clubSlug}/${postId}`,
      { traceName: "ssr:/api/posts/club/:clubSlug/:postId#GET:meta" }
    );
    return {
      title: a?.title ?? "Haber",
      description: a?.summary ?? undefined,
      openGraph: {
        title: a?.title ?? undefined,
        description: a?.summary ?? undefined,
        images: a?.cover
          ? [{ url: a.cover }]
          : a?.thumbnail
          ? [{ url: a.thumbnail }]
          : undefined,
      },
    };
  } catch {
    return { title: "Haber", description: "Kulüp haberi" };
  }
}

export default async function Page({ params }: Params) {
  const { clubSlug, postId } = await params;

  const queryClientServer = QueryClientServer();

  try {
    // 1) Detay
    await queryClientServer.prefetchQuery({
      queryKey: ["postsDetail", PostScope.CLUB, clubSlug, postId],
      queryFn: () =>
        authFetchApi<PostArticle>(`/api/posts/club/${clubSlug}/${postId}`, {
          traceName: "ssr:/api/posts/club/:clubSlug/:postId#GET",
        }),
      staleTime: 60_000,
    });

    // 2) İlgili (aynı scope/owner + article + exclude self)
    await queryClientServer.prefetchQuery({
      queryKey: ["postsRelated", PostScope.CLUB, clubSlug, postId],
      queryFn: () =>
        authFetchApi<PostArticle[]>(
          `/api/posts/club/${clubSlug}?type=${
            PostsType.ARTICLE
          }&exclude=${encodeURIComponent(postId)}&limit=6`,
          { traceName: "ssr:/api/posts/club/:clubSlug#GET:related" }
        ),
      staleTime: 60_000,
    });
  } catch (e) {
    const err = e as ApiError;
    if (err.status === 404) notFound();
    if (err.status === 401) {
      redirect(
        `/login?next=${encodeURIComponent(`/posts/club/${clubSlug}/${postId}`)}`
      );
    }
    throw err;
  }

  const state = dehydrate(queryClientServer);

  return (
    <HydrationBoundary state={state}>
      <Header />
      <main className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <GenericPostsDetail
          scope={PostScope.CLUB}
          ownerSlug={clubSlug}
          postIdOrSlug={postId}
        />
      </main>
      <Footer />
    </HydrationBoundary>
  );
}
