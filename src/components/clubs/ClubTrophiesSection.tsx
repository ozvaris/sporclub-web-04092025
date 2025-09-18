// src/components/clubs/ClubTrophiesSection.tsx
"use client";

import * as React from "react";
import type { Trophy } from "@/features/clubs/types";

type Props = {
  items?: Trophy[];
  title?: string;
  className?: string;
  isLoading?: boolean;      // istersen players/news ile aynı arabirimi koruyalım
  skeletonCount?: number;   // loading şerit sayısı
};

export default function ClubTrophiesSection({
  items = [],
  title = "Başarılarımız",
  className,
  isLoading = false,
  skeletonCount = 3,
}: Props) {
  return (
    <section className={["bg-white rounded-lg shadow-sm p-5 md:p-6", className].join(" ")}>
      <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold mb-4">{title}</h3>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-gray-200 p-4 animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-3 w-14 bg-gray-100 rounded" />
              </div>
              <div className="h-3 w-2/3 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <article
              key={t.id}
              className="rounded-md border border-gray-200 p-4 hover:shadow transition"
            >
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-[#1a237e]">{t.title}</h4>
                <span className="text-xs text-gray-500">{t.year}</span>
              </div>
              <p className="text-sm text-gray-700">
                {t.competition ?? "Yarışma"} • {t.level ?? "Local"}
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600">Henüz kupa kaydı yok.</p>
      )}
    </section>
  );
}
