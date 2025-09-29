// src/components/posts/GenericNewsDetail.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/fetchApi";
import { PostScope, PostsType, type PostArticle } from "@/features/posts/types";

type Props = {
  scope: PostScope;
  ownerSlug?: string;     // clubSlug | athleteSlug (GLOBAL için yok)
  postIdOrSlug: string;   // id veya slug
  className?: string;
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function detailPath(scope: PostScope, owner: string | undefined, id: string | number) {
  switch (scope) {
    case PostScope.CLUB: return `/posts/club/${owner}/${id}`;
    case PostScope.ATHLETE: return `/posts/athlete/${owner}/${id}`;
    default: return `/posts/global/${id}`;
  }
}

export default function GenericPostsDetail({ scope, ownerSlug, postIdOrSlug, className }: Props) {
  const qc = useQueryClient();

  // Detay — tek endpoint sözleşmesi (3 varyant)
  const detailQ = useQuery<PostArticle>({
    queryKey: ["postsDetail", scope, ownerSlug ?? null, postIdOrSlug],
    queryFn: () => {
      const base =
        scope === PostScope.CLUB
          ? `/api/posts/club/${ownerSlug}/${postIdOrSlug}`
          : scope === PostScope.ATHLETE
          ? `/api/posts/athlete/${ownerSlug}/${postIdOrSlug}`
          : `/api/posts/global/${postIdOrSlug}`;
      return fetchApi<PostArticle>(base, {
        traceName: `client:${base}#GET`,
      });
    },
    staleTime: 60_000,
  });

  // İlgili haberler — aynı scope + article + exclude self
  const relatedQ = useQuery<PostArticle[]>({
    queryKey: ["postsRelated", scope, ownerSlug ?? null, postIdOrSlug],
    queryFn: () => {
      const listBase =
        scope === PostScope.CLUB
          ? `/api/posts/club/${ownerSlug}`
          : scope === PostScope.ATHLETE
          ? `/api/posts/athlete/${ownerSlug}`
          : `/api/posts/global`;
      const url = `${listBase}?type=${PostsType.ARTICLE}&exclude=${encodeURIComponent(
        postIdOrSlug
      )}&limit=6`;
      return fetchApi<PostArticle[]>(url, {
        traceName: `client:${listBase}#GET:related`,
      });
    },
    enabled: !!detailQ.data,
    staleTime: 60_000,
  });

  // Hover prefetch (sidebar önerileri için)
  const prefetchDetail = (id: string | number) => {
    const key = ["postsDetail", scope, ownerSlug ?? null, String(id)];
    const base =
      scope === PostScope.CLUB
        ? `/api/posts/club/${ownerSlug}/${id}`
        : scope === PostScope.ATHLETE
        ? `/api/posts/athlete/${ownerSlug}/${id}`
        : `/api/posts/global/${id}`;
    qc.prefetchQuery({
      queryKey: key,
      queryFn: () => fetchApi<PostArticle>(base, { traceName: `client:${base}#GET:prefetch` }),
      staleTime: 60_000,
    });
  };

  // Loading skeleton
  if (detailQ.isLoading) {
    return (
      <div className={cx("grid gap-6 lg:grid-cols-[2fr_1fr]", className)}>
        <div className="space-y-3">
          <div className="aspect-[16/9] rounded-xl bg-gray-200 animate-pulse" />
          <div className="h-6 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-full rounded bg-gray-100 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-gray-100 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const a = detailQ.data;
  if (!a) return <p className="text-sm text-gray-600">Haber bulunamadı.</p>;

  const hero = a.cover_url || a.thumbnail || null;
  const date = a.published_at ? new Date(a.published_at).toLocaleDateString("tr-TR") : "";

  return (
    <div className={cx("grid gap-6 lg:grid-cols-[2fr_1fr]", className)}>
      {/* SOL: içerik */}
      <article>
        {/* Breadcrumbs */}
        <nav className="text-xs text-gray-500 mb-2" aria-label="breadcrumbs">
          <ol className="flex items-center gap-1 flex-wrap">
            <li><Link href="/" className="hover:underline">Anasayfa</Link></li>
            <li>›</li>
            {scope === PostScope.CLUB && ownerSlug && (
              <>
                <li><Link href={`/clubs/${ownerSlug}`} className="hover:underline">Kulüp</Link></li>
                <li>›</li>
                <li><Link href={`/posts/club/${ownerSlug}`} className="hover:underline">Haberler</Link></li>
                <li>›</li>
              </>
            )}
            {scope === PostScope.ATHLETE && ownerSlug && (
              <>
                <li><Link href={`/athletes/${ownerSlug}`} className="hover:underline">Atlet</Link></li>
                <li>›</li>
                <li><Link href={`/posts/athlete/${ownerSlug}`} className="hover:underline">Haberler</Link></li>
                <li>›</li>
              </>
            )}
            {scope === PostScope.GLOBAL && (
              <>
                <li><Link href={`/posts/global`} className="hover:underline">Haberler</Link></li>
                <li>›</li>
              </>
            )}
            <li className="text-gray-700 line-clamp-1">{a.title}</li>
          </ol>
        </nav>

        {/* Hero */}
        {hero && (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black">
            <Image
              src={hero}
              alt={a.title}
              fill
              sizes="(max-width:1024px) 100vw, 66vw"
              className="object-cover"
              priority={false}
            />
          </div>
        )}

        {/* Başlık + meta */}
        <header className="mt-3">
          <h1 className="text-xl md:text-2xl font-semibold text-[#1a237e]">{a.title}</h1>
          <div className="mt-1 text-sm text-gray-600 flex flex-wrap items-center gap-2">
            {a.author_name && <span>{a.author_name}</span>}
            {date && (
              <span>
                • <time dateTime={a.published_at ?? undefined}>{date}</time>
              </span>
            )}
            {a.categories?.length ? (
              <span className="flex flex-wrap gap-1">
                {a.categories.map((c) => (
                  <span key={c} className="rounded bg-[#f7f9fc] px-2 py-0.5 text-xs text-gray-600">
                    {c}
                  </span>
                ))}
              </span>
            ) : null}
          </div>

          {(a.tags?.length ?? 0) > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {a.tags!.map((t) => (
                <span key={t} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                  #{t.replace(/^#/, "")}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* İçerik */}
        <section className="prose prose-gray max-w-none mt-4">
          {a.content_html ? (
            <div dangerouslySetInnerHTML={{ __html: a.content_html }} />
          ) : a.content_md ? (
            <pre className="whitespace-pre-wrap text-gray-800 text-[15px]">{a.content_md}</pre>
          ) : (
            <p className="text-gray-700">{a.summary ?? "İçerik hazırlanıyor."}</p>
          )}
        </section>
      </article>

      {/* SAĞ: ilgili haberler */}
      <aside className="space-y-3">
        <h3 className="text-base font-semibold text-[#1a237e]">İlgili Haberler</h3>
        {relatedQ.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
          ))
        ) : relatedQ.data?.length ? (
          <div className="space-y-3">
            {relatedQ.data.map((n) => {
              const thumb = n.thumbnail || n.cover_url || undefined;
              const link = detailPath(scope, ownerSlug, String(n.slug ?? n.id));
              return (
                <Link
                  key={String(n.id)}
                  href={link}
                  className="group grid grid-cols-[168px_1fr] gap-3 rounded-xl p-1 hover:bg-gray-50"
                  onMouseEnter={() => prefetchDetail(String(n.slug ?? n.id))}
                >
                  <div className="relative md:w-[168px] aspect-[16/9] overflow-hidden rounded-lg bg-gray-100">
                    {thumb ? (
                      <Image src={thumb} alt={n.title} fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 grid place-content-center text-xs text-gray-500">
                        Görsel yok
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-sm font-medium group-hover:underline">
                      {n.title}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {n.published_at
                        ? new Date(n.published_at).toLocaleDateString("tr-TR")
                        : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-600">İlgili haber bulunamadı.</p>
        )}
      </aside>
    </div>
  );
}
