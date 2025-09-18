// src/components/clubs/ClubStaffSection.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import type { Staff } from "@/features/clubs/types";

type Props = {
  items?: Staff[];
  totalCount?: number;
  title?: string;
  className?: string;
  isLoading?: boolean;
  skeletonCount?: number;
};

export default function ClubStaffSection({
  items = [],
  totalCount,
  title = "Kadromuz",
  className,
  isLoading = false,
  skeletonCount = 6,
}: Props) {
  return (
    <section className={["bg-white rounded-lg shadow-sm p-5 md:p-6", className].join(" ")}>
      <div className="flex items-center justify-between">
        <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold">{title}</h3>
        <span className="text-sm text-gray-600">Toplam: {totalCount ?? items.length}</span>
      </div>

      {isLoading ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: skeletonCount }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((s) => (
            <div key={s.id} className="flex items-center gap-3 border border-gray-200 rounded-lg p-4">
              {/* Avatar */}
              <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#e0e6ed]">
                {s.avatar ? (
                  <Image
                    src={s.avatar}
                    alt={s.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    priority={false}
                  />
                ) : (
                  <div className="grid h-full w-full place-content-center text-[#1a237e]">
                    <span className="text-sm font-semibold">
                      {s.name?.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Bilgiler */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-[#1a237e] truncate">{s.name}</h4>
                  {s.role ? (
                    <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-[#f7f9fc]">{s.role}</span>
                  ) : null}
                </div>
                <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                  {s.phone && <div>📞 {s.phone}</div>}
                  {s.email && <div>📧 {s.email}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-600">Personel kaydı yok.</p>
      )}
    </section>
  );
}
