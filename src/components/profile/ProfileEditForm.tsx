// src/components/profile/ProfileEditForm.tsx
"use client";
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, apiErrorMessage } from "@/lib/fetchApi";
import type { ProfileDto } from "./ProfileSummary";
import { PanelHeader } from "./PanelHeader";
import { PrivacyStatus } from "@/types/User";

type FormState = {
  name: string;
  privacy: PrivacyStatus;
};

export function ProfileEditForm({
  data,
  onBackToSummary,
  onGoSecurity,
}: {
  data: ProfileDto;
  onBackToSummary: () => void;
  onGoSecurity: () => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = React.useState<FormState>({
    name: data?.name ?? "",
    privacy: (data?.privacy as PrivacyStatus) ?? "private",
  });
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});

  React.useEffect(() => {
    if (data) {
      setForm({
        name: data.name ?? "",
        privacy: (data.privacy as PrivacyStatus) ?? "private",
      });
    }
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
      onBackToSummary();
    },
    onError: (e) => setMsg({ err: apiErrorMessage(e, "Güncelleme başarısız.") }),
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

  return (
    <div className="rounded-2xl border p-5 md:p-6 bg-white">
      <PanelHeader
        title="Profili Düzenle"
        subtitle="Adını ve gizlilik ayarını güncelle."
        right={
          <button
            type="button"
            onClick={onGoSecurity}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            Güvenlik →
          </button>
        }
      />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          mUpdate.mutate({ name: form.name, privacy: form.privacy });
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">E-posta</span>
            <input
              value={data.email}
              disabled
              className="mt-1 w-full rounded-lg border px-3 py-2 bg-gray-50"
            />
          </label>

          <label className="block">
            <span className="text-sm text-gray-600">Ad</span>
            <input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              placeholder="Adın"
            />
          </label>
        </div>

        <fieldset>
          <legend className="text-sm text-gray-600 mb-2">Gizlilik</legend>
          <div className="flex items-center gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="privacy"
                checked={form.privacy === "private"}
                onChange={() =>
                  setForm((s) => ({ ...s, privacy: "private" as PrivacyStatus }))
                }
              />
              <span>Özel</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="privacy"
                checked={form.privacy === "public"}
                onChange={() =>
                  setForm((s) => ({ ...s, privacy: "public" as PrivacyStatus }))
                }
              />
              <span>Herkese Açık</span>
            </label>
          </div>
        </fieldset>

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

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700"
            disabled={mUpdate.isPending}
          >
            Kaydet
          </button>
          <button
            type="button"
            onClick={onBackToSummary}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            İptal
          </button>
        </div>

        {/* Danger zone */}
        <div className="mt-6 border-t pt-4">
          <h3 className="text-sm font-semibold text-red-600">Tehlikeli Alan</h3>
          <p className="text-sm text-gray-600 mt-1">
            Hesabını kalıcı olarak silebilirsin. Bu işlem geri alınamaz.
          </p>
          <button
            type="button"
            onClick={() => {
              if (confirm("Hesabını kalıcı olarak silmek istediğine emin misin?")) {
                mDelete.mutate();
              }
            }}
            className="mt-3 rounded-lg border border-red-300 text-red-600 px-4 py-2 hover:bg-red-50"
            disabled={mDelete.isPending}
          >
            Hesabı Sil
          </button>
        </div>
      </form>
    </div>
  );
}
