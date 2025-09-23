// src/server/services/posts.ts
import 'server-only';
import { authFetchApi } from '@/lib/authFetchApi';
import { PostsType, type PostArticle } from '@/features/posts/types';

/**
 * SERVER-ONLY data access layer
 * SSR (RSC) tarafında /api'ya fetch ATMADAN direkt backend'e gider.
 * API route'lar da aynı fonksiyonları kullanır.
 */

export async function getClubPostDetail(clubSlug: string, postId: string) {
  return authFetchApi<PostArticle>(
    `/admin/posts/club/${encodeURIComponent(clubSlug)}/${encodeURIComponent(postId)}`,
    { traceName: 'svc:posts.getClubPostDetail' }
  );
}

type ListClubParams = {
  type?: PostsType | string;
  exclude?: string;
  limit?: number | string;
  page?: number | string;
  tags?: string;
  categories?: string;
};

export async function listClubPosts(clubSlug: string, p: ListClubParams = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && `${v}`.length) qs.set(k, `${v}`);
  }
  const path =
    `/admin/posts/club/${encodeURIComponent(clubSlug)}` +
    (qs.toString() ? `?${qs.toString()}` : '');

  return authFetchApi<PostArticle[]>(path, { traceName: 'svc:posts.listClubPosts' });
}

/** İstersen GLOBAL için de aynı pattern */
export async function getGlobalPostDetail(postId: string) {
  return authFetchApi<PostArticle>(
    `/admin/posts/global/${encodeURIComponent(postId)}`,
    { traceName: 'svc:posts.getGlobalPostDetail' }
  );
}

export async function listGlobalPosts(p: Omit<ListClubParams, never> = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && `${v}`.length) qs.set(k, `${v}`);
  }
  const path = `/admin/posts/global${qs.toString() ? `?${qs.toString()}` : ''}`;
  return authFetchApi<PostArticle[]>(path, { traceName: 'svc:posts.listGlobalPosts' });
}

type AthleteListParams = {
  type?: PostsType | string;
  exclude?: string;
  limit?: number | string;
  page?: number | string;
  tags?: string;
  categories?: string;
};

export async function getAthletePostDetail(athleteSlug: string, postId: string) {
  // Backend endpoint örneği: /admin/posts/athlete/:athleteSlug/:postId
  return authFetchApi<PostArticle>(
    `/admin/posts/athlete/${encodeURIComponent(athleteSlug)}/${encodeURIComponent(postId)}`,
    { traceName: 'svc:posts.getAthletePostDetail' }
  );
}

export async function listAthletePosts(athleteSlug: string, p: AthleteListParams = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(p)) {
    if (v !== undefined && v !== null && `${v}`.length) qs.set(k, `${v}`);
  }
  const path =
    `/admin/posts/athlete/${encodeURIComponent(athleteSlug)}` +
    (qs.toString() ? `?${qs.toString()}` : '');

  // Dönüş tipin backend'e göre değişebilir (array/paginated). Burada PostArticle[] varsaydık.
  return authFetchApi<PostArticle[]>(path, { traceName: 'svc:posts.listAthletePosts' });
}
