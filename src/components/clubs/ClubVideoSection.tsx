// src/components/clubs/ClubVideoSection.tsx
"use client";

import * as React from "react";
import { ThumbsUp, Share2, MoreHorizontal } from "lucide-react";
import Image from 'next/image';

/** Basit className birleştirici (cn yoksa) */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Öneri kartı tipi */
export type VideoSuggestion = {
  video: string;          // url veya id
  title: string;
  channel: string;
  meta?: string;          // "5.1M views • 2 years ago" gibi
  duration?: string;      // "15:18"
  thumbnail?: string;     // verilmezse id'den hesaplanır
};

export type ClubVideoSectionProps = {
  className?: string;     // dış grid ile hizalamak için (ör. col-span-full)
  video: string;          // url veya 11 haneli id
  title: string;
  channelName: string;
  channelAvatar?: string; // opsiyonel, yoksa harf avatarı
  viewsText?: string;     // "59K views"
  timeText?: string;      // "2 weeks ago"
  hashtags?: string[];
  description?: string;
  subscribeLabel?: string; // default: "Subscribe"
  suggestions?: VideoSuggestion[];
};

/* ---------------------------------------------------- helpers */
function extractYouTubeId(input: string): string {
  const re =
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([A-Za-z0-9_-]{11})/;
  const m = input.match(re);
  if (m?.[1]) return m[1];
  if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
  return "";
}
function youtubeWatchUrl(id: string) {
  return `https://www.youtube.com/watch?v=${id}`;
}
function youtubeThumbUrl(id: string) {
  // yüksek kaliteli küçük görsel
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
/* ---------------------------------------------------- component */

export default function ClubVideoSection({
  className,
  video,
  title,
  channelName,
  channelAvatar,
  viewsText,
  timeText,
  hashtags = [],
  description = "",
  subscribeLabel = "Abone Ol",
  suggestions = [],
}: ClubVideoSectionProps) {
  const id = React.useMemo(() => extractYouTubeId(video), [video]);
  const [expanded, setExpanded] = React.useState(false);

  // açıklama kısa/geniş
  const shortText = React.useMemo(() => {
    const max = 180;
    if (!description) return "";
    return description.length > max ? description.slice(0, max).trim() + "…" : description;
  }, [description]);

  return (
    <section className={cx("grid gap-6 lg:grid-cols-[2fr_1fr]", className)}>
      {/* SOL SÜTUN: player + meta + açıklama */}
      <div className="space-y-3">
        {/* Player - full-bleed */}
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
          {id ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-white/70">
              Geçerli bir YouTube bağlantısı/ID verin
            </div>
          )}
        </div>

        {/* Başlık */}
        <h2 className="text-lg font-semibold md:text-xl">{title}</h2>

        {/* Kanal + aksiyonlar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Avatar */}
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-200">
              {channelAvatar ? (
                // dış domainler için <img> kullanıyoruz
                <Image
                  src={channelAvatar}
                  alt={channelName}
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                  {channelName?.[0]?.toUpperCase() ?? "C"}
                </div>
              )}
            </div>

            {/* Kanal metaları */}
            <div className="min-w-0">
              <div className="truncate font-medium">{channelName}</div>
              <div className="text-xs text-muted-foreground">
                {[viewsText, timeText].filter(Boolean).join(" • ")}
              </div>
            </div>
          </div>

          {/* Aksiyonlar */}
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-black">
              {subscribeLabel}
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted">
              <ThumbsUp className="h-4 w-4" />
              <span className="hidden sm:inline">Beğen</span>
            </button>
            <button className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm hover:bg-muted">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Paylaş</span>
            </button>
            <button className="inline-flex items-center justify-center rounded-full border p-2 hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Hashtag + açıklama */}
        {(hashtags.length > 0 || description) && (
          <div className="rounded-xl border bg-white p-4 text-sm text-gray-700">
            {/* hashtagler */}
            {hashtags.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {hashtags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600"
                  >
                    #{t.replace(/^#/, "")}
                  </span>
                ))}
              </div>
            )}

            {/* description collapsible */}
            {description && (
              <div>
                <p className={cx(!expanded && description.length > shortText.length && "opacity-90")}>
                  {expanded ? description : shortText}
                </p>
                {description.length > shortText.length && (
                  <button
                    type="button"
                    className="mt-2 text-xs font-medium text-gray-500 hover:underline"
                    onClick={() => setExpanded((s) => !s)}
                  >
                    {expanded ? "Daha az göster" : "Daha fazla"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SAĞ SÜTUN: öneriler */}
      <aside className="space-y-3">
        {suggestions.map((s, i) => {
          const sid = extractYouTubeId(s.video);
          const watch = sid ? youtubeWatchUrl(sid) : s.video;
          const thumb = s.thumbnail ?? (sid ? youtubeThumbUrl(sid) : undefined);

          return (
            <a
              key={`${s.title}-${i}`}
              href={watch}
              target="_blank"
              rel="noreferrer"
              className="group grid grid-cols-[168px_1fr] gap-3 rounded-xl p-1 transition-colors hover:bg-gray-50 sm:grid-cols-[168px_1fr]"
            >
              <div className="relative w-[168px] h-[96px] overflow-hidden rounded-lg bg-gray-200">
                {thumb ? (
                   <Image
                    src={thumb}
                    alt={s.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 168px, 168px"
                    style={{ borderRadius: "inherit" }}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center text-xs text-gray-500">
                    Önizleme yok
                  </div>
                )}
                {s.duration && (
                  <span className="absolute bottom-1 right-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-white"
                    style={{ background: "rgba(0,0,0,0.75)" }}>
                    {s.duration}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <div className="line-clamp-2 text-sm font-medium group-hover:underline">
                  {s.title}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {s.channel}
                  {s.meta ? ` • ${s.meta}` : ""}
                </div>
              </div>
            </a>
          );
        })}
      </aside>
    </section>
  );
}
