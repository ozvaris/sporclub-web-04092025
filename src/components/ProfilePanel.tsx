// src/components/ProfilePanel.tsx
// Tek panel görünür: ?view=summary|edit|security. Login'deki gibi BFF üzerinden fetchApi('/api/...') kullanılır.
"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { fetchApi, apiErrorMessage } from "@/lib/fetchApi";

type ProfileDto = {
  id: number;
  name: string;
  email: string;
  status: string; // örn. 'active'
  privacy: "private" | "public" | string;
};

type FormState = Pick<ProfileDto, "name" | "privacy">;

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
  const qc = useQueryClient();
  const { mode, setMode } = useMode();
  

  const { data, isLoading, isError } = useQuery<ProfileDto>({
    queryKey: ["profile"],
    queryFn: () =>
      fetchApi<ProfileDto>("/api/profile", {
        traceName: "client:/api/profile#GET",
      }),
    staleTime: 5_000,
  });

  const [form, setForm] = React.useState<FormState>({
    name: "",
    privacy: "private",
  });
  const [pw, setPw] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});

  React.useEffect(() => {
    if (data)
      setForm({
        name: data.name ?? "",
        privacy: (data.privacy as any) ?? "private",
      });
  }, [data]);

  const mUpdate = useMutation({
    mutationFn: (payload: Partial<ProfileDto>) =>
      fetchApi("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        traceName: "client:/api/profile#PATCH",
      }),
    onSuccess: async () => {
      setMsg({ ok: "Profil güncellendi." });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      setMode("summary");
    },
    onError: (e) =>
      setMsg({ err: apiErrorMessage(e, "Güncelleme başarısız.") }),
  });

  const mPassword = useMutation({
    mutationFn: (payload: { password: string; newPassword: string, newpasswordConfirm: string }) =>
      fetchApi("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        traceName: "client:/api/profile/password#POST",
      }),
    onSuccess: () => setMsg({ ok: "Parola güncellendi." }),
    onError: (e) =>
      setMsg({ err: apiErrorMessage(e, "Parola değiştirilemedi.") }),
  });

  const mDelete = useMutation({
    mutationFn: () =>
      fetchApi("/api/profile", {
        method: "DELETE",
        traceName: "client:/api/profile#DELETE",
      }),
    onSuccess: () => (window.location.href = "/login"),
    onError: (e) => setMsg({ err: apiErrorMessage(e, "Hesap silinemedi.") }),
  });

  // Ortak üst başlık + açıklama
  function PanelHeader({
    title,
    subtitle,
    right,
  }: {
    title: string;
    subtitle?: string;
    right?: React.ReactNode;
  }) {
    return (
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
    );
  }

  if (isLoading)
    return <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />;
  if (isError || !data)
    return <div className="text-red-600">Profili yüklerken sorun oldu.</div>;

  const onSaveProfile: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    setMsg({});
    mUpdate.mutate({
      // backend bazı durumlarda tam obje bekleyebiliyor → email’i de ekliyoruz
      email: data.email,
      name: form.name,
      privacy: form.privacy,
      // istersen status: data.status, id: data.id da eklenebilir (backend ignore eder)
    });
  };

  return (
    <section className="mx-auto w-full max-w-3xl">
      {/* ==== SUMMARY MODE ==== */}
      {mode === "summary" && (
        <div className="rounded-2xl border p-5 md:p-6 bg-white">
          <PanelHeader
            title="Hesap Özeti"
            subtitle="Profiline ait temel bilgileri görüyorsun."
            right={
              <button
                onClick={() => setMode("edit")}
                className="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
              >
                Güncelle
              </button>
            }
          />
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
              <div className="font-medium capitalize">{data.status}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-gray-500">Gizlilik</div>
              <div className="font-medium capitalize">{data.privacy}</div>
            </div>
            <div className="rounded-lg border p-3 sm:col-span-2">
              <div className="text-gray-500">Ad</div>
              <div className="font-medium">{data.name || "-"}</div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold text-red-700">
              Tehlikeli Bölge
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Hesabını silersen tüm verilerin kalıcı olarak kaldırılır ve bu
              işlem geri alınamaz.
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
      )}

      {/* ==== EDIT MODE ==== */}
      {mode === "edit" && (
        <div className="rounded-2xl border p-5 md:p-6 bg-white">
          <PanelHeader
            title="Profil Bilgileri"
            subtitle="Adını ve gizlilik ayarını güncelleyebilirsin."
            right={
              <div className="flex gap-2">
                <button
                  onClick={() => setMode("security")}
                  className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                >
                  Şifreyi Güncelle
                </button>
                <button
                  onClick={() => setMode("summary")}
                  className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                >
                  İptal
                </button>
              </div>
            }
          />

          {msg.ok && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
              {msg.ok}
            </div>
          )}
          {msg.err && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {msg.err}
            </div>
          )}

          <form
            onSubmit={onSaveProfile}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ad Soyad
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm((s) => ({ ...s, name: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Örn. Admin Kullanıcısı"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                E-posta
              </label>
              <input
                type="email"
                value={data.email}
                disabled
                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-700"
              />
              <p className="text-xs text-gray-500 mt-1">
                E-posta değişikliği için yöneticiye başvurmanız gerekebilir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Durum
                </label>
                <input
                  type="text"
                  value={data.status ?? "unknown"}
                  disabled
                  className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Gizlilik
                </label>
                <select
                  value={form.privacy}
                  onChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      privacy: e.target.value as "private" | "public",
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="private">Özel</option>
                  <option value="public">Herkese açık</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={mUpdate.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
              >
                {mUpdate.isPending && (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                Değişiklikleri Kaydet
              </button>
              <button
                type="button"
                onClick={() => setMode("security")}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Şifreyi Güncelle
              </button>
              <button
                type="button"
                onClick={() => setMode("summary")}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==== SECURITY MODE ==== */}
      {mode === "security" && (
        <div className="rounded-2xl border p-5 md:p-6 bg-white">
          <PanelHeader
            title="Güvenlik"
            subtitle="Parolanı değiştirerek hesabını koru."
            right={
              <button
                onClick={() => setMode("edit")}
                className="rounded-lg border px-3 py-2 hover:bg-gray-50"
              >
                ← Profili Güncelle
              </button>
            }
          />

          {msg.ok && (
            <div className="mb-4 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
              {msg.ok}
            </div>
          )}
          {msg.err && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
              {msg.err}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMsg({});
              if (!pw.newPassword || pw.newPassword.length < 8) {
                setMsg({ err: "Yeni parola en az 8 karakter." });
                return;
              }
              if (pw.newPassword !== pw.confirm) {
                setMsg({ err: "Parolalar uyuşmuyor." });
                return;
              }
              mPassword.mutate({
                password: pw.currentPassword,
                newPassword: pw.newPassword,
                newpasswordConfirm: pw.confirm,
              });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mevcut Parola
              </label>
              <input
                type="password"
                value={pw.currentPassword}
                onChange={(e) =>
                  setPw((s) => ({ ...s, currentPassword: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Yeni Parola
              </label>
              <input
                type="password"
                value={pw.newPassword}
                onChange={(e) =>
                  setPw((s) => ({ ...s, newPassword: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="new-password"
                placeholder="En az 8 karakter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Yeni Parola (Tekrar)
              </label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) =>
                  setPw((s) => ({ ...s, confirm: e.target.value }))
                }
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoComplete="new-password"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={mPassword.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
              >
                {mPassword.isPending && (
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                Parolayı Güncelle
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                ← Profili Güncelle
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
