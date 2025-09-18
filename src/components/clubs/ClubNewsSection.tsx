// src/components/clubs/ClubNewsSection.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import type { ClubNews } from "@/features/clubs/types";
import { formatTR } from "@/lib/utils/formatTR";

/** simple class joiner */
function cx(...x: Array<string | false | null | undefined>) {
  return x.filter(Boolean).join(" ");
}


export type ClubNewsSectionProps = {
  items?: ClubNews[];
  isLoading?: boolean;
  title?: string;
  className?: string;
  skeletonCount?: number;
  /** YouTube öneri thumb ile aynı: 168px genişlik + 16:9 */
  thumbWidth?: number; // default 168
};

export default function ClubNewsSection({
  items = [],
  isLoading = false,
  title = "Kulüp Haberleri ve Duyuruları",
  className,
  skeletonCount = 3,
  thumbWidth = 168,
}: ClubNewsSectionProps) {
  const thumbWidthClass = `md:w-[${thumbWidth}px]`;

  return (
    <section className={cx("bg-white rounded-lg shadow-sm p-5 md:p-6", className)}>
      <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold mb-4">{title}</h3>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="rounded-lg border bg-white p-4 animate-pulse">
              <div className={cx("rounded-lg bg-gray-200 aspect-[16/9] mb-3")} />
              <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
              <div className="h-3 w-full rounded bg-gray-100 mb-1.5" />
              <div className="h-3 w-2/3 rounded bg-gray-100" />
              <div className="h-3 w-24 rounded bg-gray-100 mt-3" />
            </div>
          ))}
        </div>
      ) : items.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((n, i) => (
            <article key={n.id ?? i} className="bg-white rounded-lg shadow-sm p-4">
              <div className="grid grid-cols-1 md:grid-cols-[168px_1fr] gap-3">
                {/* THUMBNAIL (üstte mobil, solda md+) */}
                <div
                  className={cx(
                    "relative w-full md:w-[168px] aspect-[16/9] overflow-hidden rounded-lg bg-gray-100",
                    thumbWidth !== 168 && thumbWidthClass
                  )}
                >
                  {n.thumbnail ? (
                    <Image
                      src={n.thumbnail}
                      alt={n.title ?? "thumbnail"}
                      fill
                      className="object-cover"
                      sizes={`(max-width: 768px) 100vw, ${thumbWidth}px`}
                      style={{ objectFit: "cover" }}
                      priority={i === 0}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                      Görsel yok
                    </div>
                  )}
                </div>

                {/* METİN BLOKU */}
                <div>
                  <h4 className="font-semibold text-[#1a237e] mb-2 line-clamp-2">
                    {n.title}
                  </h4>
                  <p className="text-gray-700 text-sm line-clamp-3">{n.summary ?? ""}</p>
                  <span className="text-xs text-gray-500 mt-2 block">
                    {formatTR(n.published_at)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">Henüz bir haber yok.</p>
      )}
    </section>
  );
}
