"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import {
  ProfileSummary,
  ProfileEditForm,
  ProfileSecurityForm,
  type ProfileDto,
} from "./profile";

// URL ?view=summary|edit|security kontrolü
function useMode() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();

  const mode = (search.get("view") ?? "summary") as
    | "summary"
    | "edit"
    | "security";

  function setMode(next: "summary" | "edit" | "security") {
    const params = new URLSearchParams(search.toString());
    if (next === "summary") params.delete("view");
    else params.set("view", next);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return { mode, setMode };
}

export default function ProfilePanel() {
  const { mode, setMode } = useMode();

  const { data, isLoading, isError } = useQuery<ProfileDto>({
    queryKey: ["profile"],
    queryFn: () =>
      fetchApi<ProfileDto>("/api/profile", {
        traceName: "client:/api/profile#GET",
      }),
    staleTime: 5_000,
  });

  if (isLoading) {
    return (
      <section className="max-w-3xl mx-auto">
        <div className="rounded-2xl border p-5 md:p-6 bg-white animate-pulse">
          Yükleniyor…
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="max-w-3xl mx-auto">
        <div className="rounded-2xl border p-5 md:p-6 bg-white">
          <div className="text-red-600">Profili yüklerken sorun oldu.</div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto">
      {mode === "summary" && (
        <ProfileSummary
          data={data}
          onEdit={() => setMode("edit")}
          onSecurity={() => setMode("security")}
        />
      )}

      {mode === "edit" && (
        <ProfileEditForm
          data={data}
          onBackToSummary={() => setMode("summary")}
          onGoSecurity={() => setMode("security")}
        />
      )}

      {mode === "security" && (
        <ProfileSecurityForm onBackToEdit={() => setMode("edit")} />
      )}
    </section>
  );
}
