// src/components/clubs/ClubPlayersSection.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import type { ClubPlayer } from "@/features/clubs/types";

type NewPlayer = {
  name: string;
  position: string;
  age: number | "";
  defense: number | "";
  offense: number | "";
};

export type ClubPlayersSectionProps = {
  players?: ClubPlayer[];
  isLoading?: boolean;
  title?: string;
  className?: string;
  /** Yeni oyuncu kaydını üst komponentte yaparsın (mutation). Hata fırlatabilirsin. */
  onCreate: (payload: NewPlayer) => Promise<void> | void;
};

export default function ClubPlayersSection({
  players = [],
  isLoading = false,
  title = "Oyuncu Yönetimi",
  className,
  onCreate,
}: ClubPlayersSectionProps) {
  const [adding, setAdding] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});

  const [form, setForm] = React.useState<NewPlayer>({
    name: "",
    position: "",
    age: "",
    defense: "",
    offense: "",
  });

  async function handleSave() {
    // try {
    //   setSaving(true);
    //   setMsg({});
    //   await onCreate({
    //     name: form.name.trim(),
    //     position: form.position?.trim() || "",
    //     age: form.age === "" ? undefined : Number(form.age),
    //     defense: form.defense === "" ? undefined : Number(form.defense),
    //     offense: form.offense === "" ? undefined : Number(form.offense),
    //   });
    //   setMsg({ ok: "Oyuncu eklendi." });
    //   setForm({ name: "", position: "", age: "", defense: "", offense: "" });
    //   setAdding(false);
    // } catch (e: any) {
    //   setMsg({ err: e?.message || "Kayıt başarısız." });
    // } finally {
    //   setSaving(false);
    // }
  }

  return (
    <section className={["bg-white rounded-lg shadow-sm p-5 md:p-6", className].join(" ")}>
      <div className="flex items-center justify-between">
        <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold">{title}</h3>

        <button
          onClick={() => setAdding((s) => !s)}
          className="rounded-lg bg-[#1a237e] text-white px-3 py-2 hover:bg-[#283593]"
        >
          {adding ? "Ekleme Panelini Kapat" : "Yeni Oyuncu Ekle"}
        </button>
      </div>

      <p className="text-sm text-gray-600 mt-1">
        Mevcut oyuncularınızı yönetin veya yeni oyuncu profilleri oluşturun.
      </p>

      {/* Flash mesajları */}
      {msg.ok ? (
        <div className="mt-3 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
          {msg.ok}
        </div>
      ) : null}
      {msg.err ? (
        <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {msg.err}
        </div>
      ) : null}

      {/* Ekleme Paneli */}
      {adding && (
        <div className="mt-4 rounded-lg border border-gray-200 p-4 bg-white">
          <h4 className="font-medium text-[#1a237e] mb-3">Yeni Oyuncu Ekle</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <input
              className="rounded border px-3 py-2"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Pozisyon (ör. Forvet)"
              value={form.position}
              onChange={(e) => setForm((s) => ({ ...s, position: e.target.value }))}
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Yaş"
              type="number"
              min={10}
              max={60}
              value={form.age}
              onChange={(e) =>
                setForm((s) => ({ ...s, age: e.target.value ? Number(e.target.value) : "" }))
              }
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Defans"
              type="number"
              min={0}
              max={100}
              value={form.defense}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  defense: e.target.value ? Number(e.target.value) : "",
                }))
              }
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Ofans"
              type="number"
              min={0}
              max={100}
              value={form.offense}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  offense: e.target.value ? Number(e.target.value) : "",
                }))
              }
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="inline-flex items-center rounded-md bg-[#1a237e] px-4 py-2 text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              onClick={() => setAdding(false)}
              className="inline-flex items-center rounded-md bg-[#ef5350] px-4 py-2 text-white hover:opacity-90"
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}

      {/* Oyuncu Kartları */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4 animate-pulse space-y-3">
                <div className="relative w-full h-[180px] bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
                <div className="h-3 w-1/2 bg-gray-100 rounded" />
                <div className="h-2 w-full bg-gray-100 rounded" />
                <div className="h-2 w-5/6 bg-gray-100 rounded" />
                <div className="h-8 w-full bg-gray-200 rounded mt-3" />
              </div>
            ))
          : players.map((p) => (
              <article key={p.id} className="rounded-lg border border-gray-200 p-4">
                <div className="relative w-full h-[350px] mb-2">
                  <Image
                    src={
                      p.cardImage ??
                      "https://placehold.co/300x180/001a72/ffffff?text=Oyuncu+Kartı"
                    }
                    alt={p.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 25vw"
                    className="object-cover rounded"
                    style={{ objectFit: "cover" }}
                  />
                </div>

                <h4 className="font-semibold text-[#1a237e]">{p.name}</h4>
                <p className="text-xs text-gray-500 mb-2">{p.position ?? "-"}</p>

                {/* basit istatistik barları */}
                <div className="text-sm text-gray-600">
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Defans</span>
                      <span>{p.defense ?? 50}</span>
                    </div>
                    <div className="bg-[#e0e6ed] h-2 rounded">
                      <div
                        className="bg-[#42a5f5] h-2 rounded"
                        style={{ width: `${Math.min(100, p.defense ?? 50)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span>Ofans</span>
                      <span>{p.offense ?? 50}</span>
                    </div>
                    <div className="bg-[#e0e6ed] h-2 rounded">
                      <div
                        className="bg-[#ef5350] h-2 rounded"
                        style={{ width: `${Math.min(100, p.offense ?? 50)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  className="mt-3 w-full rounded-md bg-[#28a745] px-3 py-2 text-white hover:bg-[#218838] text-sm"
                  onClick={() => alert(`Performans: ${p.name}`)}
                >
                  Performansı Görüntüle
                </button>
              </article>
            ))}
      </div>
    </section>
  );
}
