// src/components/profile/ProfileSecurityForm.tsx
"use client";
import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { fetchApi, apiErrorMessage } from "@/lib/fetchApi";
import { PanelHeader } from "./PanelHeader";

type PasswordForm = {
  current: string;
  next: string;
  confirm: string;
};

export function ProfileSecurityForm({
  onBackToEdit,
}: {
  onBackToEdit: () => void;
}) {
  const [form, setForm] = React.useState<PasswordForm>({
    current: "",
    next: "",
    confirm: "",
  });
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});

  const mPassword = useMutation({
    mutationFn: () =>
      fetchApi("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current: form.current,
          next: form.next,
          confirm: form.confirm,
        }),
        traceName: "client:/api/profile/password#POST",
      }),
    onSuccess: () => setMsg({ ok: "Parola güncellendi." }),
    onError: (e) => setMsg({ err: apiErrorMessage(e, "Parola değiştirilemedi.") }),
  });

  return (
    <div className="rounded-2xl border p-5 md:p-6 bg-white">
      <PanelHeader
        title="Güvenlik"
        subtitle="Parolanı değiştirerek hesabını koru."
        right={
          <button
            onClick={onBackToEdit}
            className="rounded-lg border px-3 py-2 hover:bg-gray-50"
          >
            ← Profili Güncelle
          </button>
        }
      />

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (form.next !== form.confirm) {
            setMsg({ err: "Yeni parola ile doğrulama eşleşmiyor." });
            return;
          }
          mPassword.mutate();
        }}
      >
        <label className="block">
          <span className="text-sm text-gray-600">Mevcut parola</span>
          <input
            type="password"
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.current}
            onChange={(e) => setForm((s) => ({ ...s, current: e.target.value }))}
            placeholder="••••••••"
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm text-gray-600">Yeni parola</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.next}
              onChange={(e) => setForm((s) => ({ ...s, next: e.target.value }))}
              placeholder="••••••••"
            />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Yeni parola (tekrar)</span>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.confirm}
              onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
              placeholder="••••••••"
            />
          </label>
        </div>

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
            disabled={mPassword.isPending}
          >
            Şifreyi Güncelle
          </button>
          <button
            type="button"
            onClick={onBackToEdit}
            className="rounded-lg border px-4 py-2 hover:bg-gray-50"
          >
            ← Profili Güncelle
          </button>
        </div>
      </form>
    </div>
  );
}
