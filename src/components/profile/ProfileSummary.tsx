// src/components/profile/ProfileSummary.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { PanelHeader } from "./PanelHeader";
import { useMutation } from "@tanstack/react-query";
import { apiErrorMessage, fetchApi } from "@/lib/fetchApi";
import { PrivacyStatusDescription, UserStatusDescription } from "@/types/User";

export type ProfileDto = {
  id: number;
  name: string;
  email: string;
  status: string;
  privacy: "private" | "public" | string;
};

export function ProfileSummary({
  data,
  onEdit,
  onSecurity,
}: {
  data: ProfileDto;
  onEdit: () => void;
  onSecurity: () => void;
}) {
  const router = useRouter();
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});

  React.useEffect(() => {
    router.prefetch("/clubs/aslan-spor/admin");
  }, [router]);

  const mDelete = useMutation({
    mutationFn: () =>
      fetchApi("/api/profile", {
        method: "DELETE",
        traceName: "client:/api/profile#DELETE",
      }),
    onSuccess: () => (window.location.href = "/login"),
    onError: (e) => setMsg({ err: apiErrorMessage(e, "Hesap silinemedi.") }),
  });

  return (
    <div className="rounded-2xl border p-5 md:p-6 bg-white">
      <PanelHeader
        title="Hesap Özeti"
        subtitle="Profiline ait temel bilgileri görüyorsun."
        right={
          <div className="flex gap-2">
            <button
              onClick={onSecurity}
              className="rounded-lg border px-3 py-2 hover:bg-gray-50"
            >
              Güvenlik →
            </button>
            <button
              onClick={onEdit}
              className="rounded-lg bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700"
            >
              Profili Düzenle
            </button>
          </div>
        }
      />
      {msg.ok && (
        <div className="rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">
          {msg.ok}
        </div>
      )}
      {msg.err && (
        <div className="rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">
          {msg.err}
        </div>
      )}

      {/* Profil bilgileri grid’i (AYNEN DURUYOR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div className="rounded-lg border p-3">
          <div className="text-gray-500">Kullanıcı ID</div>
          <div className="font-medium">{data.id}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-gray-500">E-posta</div>
          <div className="font-medium">{data.email}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-gray-500">Durum</div>
          <div className="font-medium capitalize">{UserStatusDescription[(data.status || '').toUpperCase() as keyof typeof UserStatusDescription]}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-gray-500">Gizlilik</div>
          <div className="font-medium capitalize">{PrivacyStatusDescription[(data.privacy || '').toUpperCase() as keyof typeof PrivacyStatusDescription]}</div>
        </div>
        <div className="rounded-lg border p-3 sm:col-span-2">
          <div className="text-gray-500">Ad</div>
          <div className="font-medium">{data.name || "-"}</div>
        </div>
      </div>

      {/* >>> BURASI YENİ – Kulüp Yönetimi kısayol kartı <<< */}
      <div className="mt-6 rounded-lg border p-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Kulüp Yönetimi</h3>
          <p className="text-sm text-gray-600">
            Aslan Spor kulübünü yönetmek için paneli aç.
          </p>
        </div>
        <button
          onClick={() => router.push("/clubs/aslan-spor/admin")}
          className="rounded-lg bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700"
          aria-label="Kulüp yönetim panelini aç"
        >
          Paneli Aç
        </button>
      </div>
      <div className="mt-6 rounded-lg border p-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">Kulüp Yönetimi</h3>
          <p className="text-sm text-gray-600">Aslan Spor News Aç</p>
        </div>
        <button
          onClick={() => router.push("/posts/club/storybox/c-1")}
          className="rounded-lg bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700"
          aria-label="Kulüp haberini aç"
        >
          Haber Aç
        </button>
      </div>
      {/* <<< /YENİ KISIM >>> */}

      {/* Tehlikeli Bölge (AYNEN DURUYOR) */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-sm font-semibold text-red-700">Tehlikeli Bölge</h3>
        <p className="text-sm text-gray-600 mt-1">
          Hesabını silersen tüm verilerin kalıcı olarak kaldırılır ve bu işlem
          geri alınamaz.
        </p>
        <button
          onClick={() => {
            if (confirm("Hesabınızı silmek istediğinize emin misiniz?"))
              mDelete.mutate();
          }}
          className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50"
        >
          Hesabı Sil
        </button>
      </div>
    </div>
  );
}
