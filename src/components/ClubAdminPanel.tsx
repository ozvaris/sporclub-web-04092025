// src/components/ClubAdminPanel.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiErrorMessage, fetchApi } from "@/lib/fetchApi";
import type {
  Club,
  ClubNews,
  ClubPlayer,
  Trophy,
  Staff,
} from "@/features/clubs/types";

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
      fetchApi<Club>(`/api/clubs/${slug}`, {
        traceName: "client:/api/clubs/:slug#GET",
      }),
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
    mutationFn: async (payload: {
      id: number;
      defense: number;
      offense: number;
    }) => {
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
    onError: (e) =>
      setMsg({ err: apiErrorMessage(e, "Performans güncellenemedi.") }),
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
    <section
      className={`${roboto.className} container mx-auto my-8 p-4 md:p-8 bg-[#f7f9fc] rounded-[12px] shadow-[0_5px_15px_rgba(0,0,0,0.10)] space-y-8`}
    >
      {/* Başlık */}
      <header className="relative">
        {/* Orta hizalı başlık */}
        <div className="text-center">
          <h2 className="text-[#1a237e] text-2xl md:text-3xl font-bold mb-2">
            Kulüp Yönetim Paneli: {club.name}
          </h2>
          <p className="mt-1 text-gray-600">
            {club.league ?? "Lig bilgisi yok"} • Kuruluş: {club.founded ?? "-"}
          </p>
        </div>

        {/* Sağ üst sayaçlar (md+ görünür) */}
        <div className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 items-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f9fc] px-3 py-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#ef5350"
                d="M12 21s-6.716-4.41-9.173-7.08C.857 11.7.86 8.5 3.07 6.66A5.1 5.1 0 0 1 6.5 5.5c1.42 0 2.8.55 3.8 1.55A5.377 5.377 0 0 1 14.1 5.5c1.37 0 2.74.52 3.77 1.5 2.21 1.84 2.21 5.04.243 7.26C18.71 16.6 12 21 12 21z"
              />
            </svg>
            <span className="font-medium text-[#1a237e]">{50}</span>
            <span className="text-gray-600"></span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f9fc] px-3 py-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#42a5f5"
                d="M20 2H4a2 2 0 0 0-2 2v15.17a1 1 0 0 0 1.707.707L6.586 17H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
              />
            </svg>
            <span className="font-medium text-[#1a237e]">{100}</span>
            <span className="text-gray-600"></span>
          </div>
        </div>

        {/* Mobil görünüm (başlığın altında ortalı) */}
        <div className="mt-3 flex md:hidden justify-center gap-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f9fc] px-3 py-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#ef5350"
                d="M12 21s-6.716-4.41-9.173-7.08C.857 11.7.86 8.5 3.07 6.66A5.1 5.1 0 0 1 6.5 5.5c1.42 0 2.8.55 3.8 1.55A5.377 5.377 0 0 1 14.1 5.5c1.37 0 2.74.52 3.77 1.5 2.21 1.84 2.21 5.04.243 7.26C18.71 16.6 12 21 12 21z"
              />
            </svg>
            <span className="font-medium text-[#1a237e]">{50}</span>
            <span className="text-gray-600">beğeni</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f9fc] px-3 py-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#42a5f5"
                d="M20 2H4a2 2 0 0 0-2 2v15.17a1 1 0 0 0 1.707.707L6.586 17H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
              />
            </svg>
            <span className="font-medium text-[#1a237e]">{100}</span>
            <span className="text-gray-600">yorum</span>
          </div>
        </div>
      </header>

      {/* Kulüp Bilgileri + Tesisler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kulüp Bilgileri */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
          <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold mb-4">
            Kulüp Bilgileri
          </h3>
          <p className="text-gray-700 text-sm mb-4">
            {club.history ??
              "Aslan Spor Kulübü, topluma ve genç yeteneklere sporu sevdirmeyi misyon edinmiştir."}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <span>📍</span>
              <span>Adres: {club.address ?? "-"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span>📞</span>
              <span>Telefon: {club.phone ?? "-"}</span>
            </div>
            <div className="flex items-start gap-2">
              <span>📧</span>
              <span>E-posta: {club.email ?? "-"}</span>
            </div>
          </div>
        </div>

        {/* Tesislerimiz */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
          <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold mb-4">
            Tesislerimiz
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(club.facilities?.length
              ? club.facilities
              : [
                  {
                    src: "https://placehold.co/300x200/42a5f5/ffffff?text=Tesis+Gorseli+1",
                    alt: "Tesis Görseli 1",
                  },
                  {
                    src: "https://placehold.co/300x200/42a5f5/ffffff?text=Tesis+Gorseli+2",
                    alt: "Tesis Görseli 2",
                  },
                ]
            ).map((img: { src: string; alt?: string } | string, i: number) => (
              <div
                key={i}
                className="relative w-full h-[200px] overflow-hidden rounded-md"
              >
                {typeof img === "string" ? (
                  // string URL ise img ile; Next Image da olabilir:
                  <Image
                    src={img}
                    alt={`Tesis ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Image
                    src={img.src}
                    alt={img.alt ?? `Tesis ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* (Opsiyonel ama referansta var) KPI kutuları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-4xl font-bold text-[#1a237e]">
            {playersQ.data?.length ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Toplam Oyuncu</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-4xl font-bold text-[#1a237e]">
            {newsQ.data?.length ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Kanal/Haber/Duyuru</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-4xl font-bold text-[#1a237e]">
            {club.trophies?.length ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Kupa/Ödül</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 text-center">
          <div className="text-4xl font-bold text-[#1a237e]">
            {club.staffCount ?? 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Personel</div>
        </div>
      </div>

      {/* Kulüp Haberleri ve Duyuruları */}
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold mb-4">
          Kulüp Haberleri ve Duyuruları
        </h3>

        {newsQ.data?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {newsQ.data?.map((n: ClubNews, i: number) => (
              <article key={i} className="bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-semibold text-[#1a237e] mb-2">{n.title}</h4>
                <p className="text-gray-700 text-sm">{n.summary ?? ""}</p>
                <span className="text-xs text-gray-500 mt-2 block">
                  {n.published_at
                    ? new Date(n.published_at).toLocaleDateString("tr-TR")
                    : ""}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Henüz bir haber yok.</p>
        )}
      </div>

      {/* Oyuncu Yönetimi */}
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold">
            Oyuncu Yönetimi
          </h3>

          {/* Referansta aksan renkleri lacivert/yeşil. Ekle butonunu lacivert yaptım */}
          <button
            onClick={() => setAdding((s: boolean) => !s)}
            className="rounded-lg bg-[#1a237e] text-white px-3 py-2 hover:bg-[#283593]"
          >
            {adding ? "Ekleme Panelini Kapat" : "Yeni Oyuncu Ekle"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Mevcut oyuncularınızı yönetin veya yeni oyuncu profilleri oluşturun.
        </p>

        {msg?.ok && (
          <div className="mt-3 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">
            {msg.ok}
          </div>
        )}
        {msg?.err && (
          <div className="mt-3 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">
            {msg.err}
          </div>
        )}

        {/* Ekleme Formu */}
        {adding && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border rounded-lg p-4">
            {/* form alanların senin state'lerinle aynı; sadece sınıflar referans görseline göre */}
            <input
              className="rounded border px-3 py-2"
              placeholder="Ad Soyad"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
            <input
              className="rounded border px-3 py-2"
              placeholder="Mevki (Örn: Forvet)"
              value={form.position}
              onChange={(e) =>
                setForm((s) => ({ ...s, position: e.target.value }))
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

            <div className="md:col-span-2 flex items-center gap-3">
              {/* referans .action-btn -> #28a745 */}
              <button
                onClick={() =>
                  createPlayer.mutate({
                    name: form.name,
                    position: form.position,
                    age: Number(form.age) || 0,
                    defense: Number(form.defense) || 0,
                    offense: Number(form.offense) || 0,
                  })
                }
                className="inline-flex items-center rounded-md bg-[#28a745] px-4 py-2 text-white hover:bg-[#218838]"
              >
                Kaydet
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
          {/* Referanstaki “Yeni Oyuncu Ekle” kutusu */}
          {/* <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div
              className="relative w-full h-[180px] mb-2 cursor-pointer hover:opacity-80 transition"
              onClick={() => setAdding(true)}
            >
              <Image
                src="https://placehold.co/150x180/F7931E/ffffff?text=Yeni+Oyuncu+Ekle"
                alt="Yeni Oyuncu Ekle"
                fill
                className="object-cover mx-auto"
                style={{ objectFit: "cover" }}
              />
            </div>
            <h4 className="font-semibold text-[#1a237e]">Yeni Oyuncu Ekle</h4>
            <p className="text-xs text-gray-500">
              Profil oluştur ve Bonus kartı bas.
            </p>
          </div> */}

          {playersQ.data?.map((p: ClubPlayer, idx: number) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="relative w-full h-[350px] overflow-hidden rounded-md mb-3">
                <Image
                  src={
                    p.cardImage ??
                    "https://placehold.co/300x180/42a5f5/ffffff?text=Oyuncu+Gorseli"
                  }
                  alt={p.name}
                  fill
                  className="object-cover"
                />
              </div>

              <h4 className="font-semibold text-[#1a237e]">{p.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{p.position ?? "-"}</p>

              {/* Basit istatistik şeritleri (referans .stat-bar-container/.stat-bar) */}
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

      {/* Başarılarımız / Kupalar */}
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold mb-4">
          Başarılarımız
        </h3>

        {Array.isArray(club.trophies) && club.trophies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {club.trophies.map((t: Trophy) => (
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
      </div>

      {/* Kadromuz / Personel */}
      <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[#1a237e] text-lg md:text-xl font-semibold">
            Kadromuz
          </h3>
          <span className="text-sm text-gray-600">
            Toplam: {club.staffCount ?? 0}
          </span>
        </div>

        {Array.isArray(club.staffs) && club.staffs.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {club.staffs.map((s: Staff) => (
              <div
                key={s.id}
                className="flex items-center gap-3 border border-gray-200 rounded-lg p-4"
              >
                {/* Avatar */}
                <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-[#e0e6ed]">
                  {s.avatar ? (
                    // Next <Image> de kullanabilirsiniz
                    <Image
                      src={s.avatar}
                      alt={s.name}
                      fill
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-content-center text-[#1a237e]">
                      {/* basit initials */}
                      <span className="text-sm font-semibold">
                        {s.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bilgiler */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-[#1a237e] truncate">
                      {s.name}
                    </h4>
                    <span className="text-xs text-gray-500 px-2 py-0.5 rounded bg-[#f7f9fc]">
                      {s.role}
                    </span>
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
      </div>

      {/* Yönetim İşlemleri (örnek aksiyon butonları) */}
      <div className="flex flex-wrap items-center gap-3">
        <button className="inline-flex items-center rounded-md bg-[#28a745] px-4 py-2 text-white hover:bg-[#218838]">
          Profil Bilgilerini Güncelle
        </button>
        <button className="inline-flex items-center rounded-md bg-[#1a237e] px-4 py-2 text-white hover:bg-[#283593]">
          Kulübü Yayınla
        </button>
      </div>
    </section>
  );
}
