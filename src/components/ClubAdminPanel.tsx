// src/components/ClubAdminPanel.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage, fetchApi } from "@/lib/fetchApi";
import type { Club, ClubNews, ClubPlayer } from "@/features/clubs/types";

import style from "../app/talenty.module.css";

/** Tema CSS Module + (opsiyonel) Roboto font */
import { Roboto } from "next/font/google";
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

type NewPlayer = {
  name: string;
  position: string;
  age: number | "";
  defense: number | "";
  offense: number | "";
};

export default function ClubAdminPanel({ slug }: { slug: string }) {
  const qc = useQueryClient();

  // Queries
  const clubQ = useQuery<Club>({
    queryKey: ["club", slug],
    queryFn: () =>
      fetchApi<Club>(`/api/clubs/${slug}`, { traceName: "client:/api/clubs/:slug#GET" }),
    staleTime: 60_000,
  });

  const newsQ = useQuery<ClubNews[]>({
    queryKey: ["clubNews", slug],
    queryFn: () =>
      fetchApi<ClubNews[]>(`/api/clubs/${slug}/news`, {
        traceName: "client:/api/clubs/:slug/news#GET",
      }),
    staleTime: 60_000,
  });

  const playersQ = useQuery<ClubPlayer[]>({
    queryKey: ["clubPlayers", slug],
    queryFn: () =>
      fetchApi<ClubPlayer[]>(`/api/clubs/${slug}/players`, {
        traceName: "client:/api/clubs/:slug/players#GET",
      }),
    staleTime: 60_000,
  });

  // Local UI state
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});
  const [adding, setAdding] = React.useState(false);
  const [form, setForm] = React.useState<NewPlayer>({
    name: "",
    position: "",
    age: "",
    defense: "",
    offense: "",
  });

  // Mutations
  const createPlayer = useMutation({
    mutationKey: ["createPlayer", slug],
    mutationFn: async (payload: NewPlayer) => {
      return fetchApi(`/api/clubs/${slug}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        traceName: "client:/api/clubs/:slug/players#POST",
      });
    },
    onSuccess: async () => {
      setMsg({ ok: "Oyuncu eklendi." });
      setAdding(false);
      setForm({ name: "", position: "", age: "", defense: "", offense: "" });
      await qc.invalidateQueries({ queryKey: ["clubPlayers", slug] });
    },
    onError: (e) => setMsg({ err: apiErrorMessage(e, "Oyuncu eklenemedi.") }),
  });

  const updatePerf = useMutation({
    mutationKey: ["updatePerf", slug],
    mutationFn: async (payload: { id: number; defense: number; offense: number }) => {
      return fetchApi(`/api/clubs/${slug}/players`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        traceName: "client:/api/clubs/:slug/players#PATCH",
      });
    },
    onSuccess: async () => {
      setMsg({ ok: "Performans güncellendi." });
      await qc.invalidateQueries({ queryKey: ["clubPlayers", slug] });
    },
    onError: (e) => setMsg({ err: apiErrorMessage(e, "Performans güncellenemedi.") }),
  });

  // Loading / Error
  if (clubQ.isLoading || newsQ.isLoading || playersQ.isLoading) {
    return <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />;
  }
  if (clubQ.isError || !clubQ.data) {
    return <div className="text-red-600">Kulüp bilgileri yüklenemedi.</div>;
  }

  const club = clubQ.data;

  return (
    <section className={`${style.caTheme} ${roboto.className} space-y-8`}>
      {/* Header */}
      <header className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold">
          Kulüp Yönetim Paneli: {club.name}
        </h1>
        <p className="mt-2 text-gray-600">
          {club.league ?? "Lig bilgisi yok"} • Kuruluş: {club.founded ?? "-"}
        </p>
      </header>

      {/* Kulüp Bilgileri + Tesisler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-2xl border bg-white p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Kulüp Bilgileri</h2>
          <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">
            {club.history ??
              "Aslan Spor Kulübü, topluma ve genç yeteneklere sporu sevdirmeyi misyon edinmiştir."}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span>📍</span>
              <span>{club.address ?? "Adres bilgisi yok"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span>📞</span>
              <span>{club.phone ?? "-"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span>📧</span>
              <span>{club.email ?? "-"}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-5 md:p-6">
          <h2 className="text-lg md:text-xl font-semibold mb-3">Tesislerimiz</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(club.facilities?.length
              ? club.facilities
              : [
                  {
                    src: "http://localhost:3000/media/dev-images/club1.jpg",
                    alt: "Tesis 1",
                  },
                  {
                    src: "http://localhost:3000/media/dev-images/club2.webp",
                    alt: "Tesis 2",
                  },
                ]
            ).map((img, i) => (
              <div
                key={i}
                className="relative w-full aspect-video overflow-hidden rounded-lg"
              >
                <Image
                  src={img.src}
                  alt={img.alt ?? `Tesis ${i + 1}`}
                  fill
                  sizes="(max-width:768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Haberler */}
      <div className="rounded-2xl border bg-white p-5 md:p-6">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          Kulüp Haberleri ve Duyuruları
        </h2>
        {newsQ.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsQ.data.map((n) => (
              <article key={n.id} className="p-4 rounded-lg border bg-white">
                <h3 className="font-semibold text-gray-900 mb-1">{n.title}</h3>
                <p className="text-sm text-gray-700">{n.summary}</p>
                <span className="text-xs text-gray-500 mt-2 block">
                  {new Date(n.published_at).toLocaleDateString("tr-TR")}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Henüz bir haber yok.</p>
        )}
      </div>

      {/* Oyuncu Yönetimi */}
      <div className="rounded-2xl border bg-white p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg md:text-xl font-semibold">Oyuncu Yönetimi</h2>
          <button
            onClick={() => setAdding((s) => !s)}
            className="rounded-lg bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700"
          >
            {adding ? "Ekleme Panelini Kapat" : "Yeni Oyuncu Ekle"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Mevcut oyuncuları yönetin ya da yeni oyuncu profili oluşturun.
        </p>

        {msg.ok && (
          <div className="mt-3 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
            {msg.ok}
          </div>
        )}
        {msg.err && (
          <div className="mt-3 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {msg.err}
          </div>
        )}

        {adding && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setMsg({});
              if (!form.name || !form.position) {
                setMsg({ err: "İsim ve mevki zorunludur." });
                return;
              }
              createPlayer.mutate({
                name: form.name,
                position: form.position,
                age: Number(form.age) || 0,
                defense: Number(form.defense) || 0,
                offense: Number(form.offense) || 0,
              });
            }}
            className="mt-4 grid grid-cols-1 md:grid-cols-6 gap-3"
          >
            <input
              className="rounded border px-3 py-2 md:col-span-2"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={(e) =>
                setForm((s) => ({ ...s, name: e.target.value }))
              }
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Mevki (ST, OS, STP...)"
              value={form.position}
              onChange={(e) =>
                setForm((s) => ({ ...s, position: e.target.value }))
              }
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Yaş"
              type="number"
              min={10}
              value={form.age}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  age: e.target.value ? Number(e.target.value) : "",
                }))
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
            <button
              type="submit"
              disabled={createPlayer.isPending}
              className="rounded bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 disabled:opacity-60"
            >
              {createPlayer.isPending ? "Ekleniyor..." : "Ekle"}
            </button>
          </form>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* “Yeni Oyuncu Ekle” görsel kartı */}
          <div className="p-4 rounded-lg border bg-white flex flex-col items-center justify-center">
            <div className="relative w-[150px] h-[180px]">
              <Image
                src="http://localhost:3000/media/dev-images/club3.jpg"
                alt="Yeni Oyuncu Ekle"
                fill
                sizes="150px"
                className="object-cover rounded"
              />
            </div>
            <h3 className="font-semibold mt-2">Yeni Oyuncu Ekle</h3>
            <p className="text-xs text-gray-500">Profil oluştur ve Bonus kartı bas.</p>
          </div>

          {playersQ.data?.map((p) => (
            <div key={p.id} className="p-4 rounded-lg border bg-white">
              <div className="relative w-[150px] h-[180px] mx-auto">
                <Image
                  src={
                    p.cardImage ?? "http://localhost:3000/media/dev-images/club1.jpg"
                  }
                  alt={`${p.name} Oyuncu Kartı`}
                  fill
                  sizes="150px"
                  className="object-cover rounded"
                />
              </div>
              <h4 className="font-semibold text-gray-900 mt-2 text-center">
                {p.name}
              </h4>
              <p className="text-xs text-gray-500 text-center">
                Mevki: {p.position ?? "-"}, Yaş: {p.age ?? "-"}
              </p>
              <button
                className="w-full mt-2 rounded border px-2 py-1 text-sm hover:bg-gray-50"
                onClick={() =>
                  updatePerf.mutate({
                    id: p.id,
                    defense: Math.min(100, (p.defense ?? 50) + 1),
                    offense: p.offense ?? 50,
                  })
                }
              >
                Performans Güncelle
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
