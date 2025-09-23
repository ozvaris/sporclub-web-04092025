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
} from "@/features/clubs/types";

/** Tema CSS Module + (opsiyonel) Roboto font */
import { Roboto } from "next/font/google";
import ClubVideoSection from "./clubs/ClubVideoSection";
import ClubNewsSection from "@/components/clubs/ClubNewsSection";
import ClubPlayersSection from "@/components/clubs/ClubPlayersSection";
import ClubTrophiesSection from "@/components/clubs/ClubTrophiesSection";
import ClubStaffSection from "@/components/clubs/ClubStaffSection";


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
      fetchApi<ClubNews[]>(`/api/clubs/${slug}/posts`, {
        traceName: "client:/api/clubs/:slug/posts#GET",
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
            <span className="font-medium text-[#1a237e]">{50} beğeni</span>
            <span className="text-gray-600"></span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-[#f7f9fc] px-3 py-1">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#42a5f5"
                d="M20 2H4a2 2 0 0 0-2 2v15.17a1 1 0 0 0 1.707.707L6.586 17H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
              />
            </svg>
            <span className="font-medium text-[#1a237e]">{100} yorum</span>
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

      <ClubVideoSection
        className="col-span-full"
        video="https://www.youtube.com/watch?v=LxnilbLr2nQ"
        title="He Watched a Video and Built a Robot…"
        channelName="StoryBox"
        channelAvatar="http:/localhost:3000/media/dev-images/channelsicon.jpg" // opsiyonel
        viewsText="59K views"
        timeText="2 weeks ago"
        hashtags={["Robot", "Industrialist", "Storybox"]}
        description="His story began with a dream... At the age of six, he sold gum..."
        suggestions={[
          {
            video: "https://www.youtube.com/watch?v=LxnilbLr2nQ",
            title: "Entropy, Hawking Radiation...",
            channel: "Doğal Frekans",
            meta: "20K views • 3 days ago",
            duration: "26:59",
          },
          {
            video: "https://www.youtube.com/watch?v=LxnilbLr2nQ",
            title: "300mph 480kmh | World's Fastest FPV Drone",
            channel: "Mike Bell",
            meta: "352K views • 1 year ago",
            duration: "14:52",
          },
          // {
          //   video: "https://www.youtube.com/watch?v=LxnilbLr2nQ",
          //   title: "300mph 480kmh | World's Fastest FPV Drone",
          //   channel: "Mike Bell",
          //   meta: "352K views • 1 year ago",
          //   duration: "14:52",
          // },
          // {
          //   video: "https://www.youtube.com/watch?v=LxnilbLr2nQ",
          //   title: "300mph 480kmh | World's Fastest FPV Drone",
          //   channel: "Mike Bell",
          //   meta: "352K views • 1 year ago",
          //   duration: "14:52",
          // },
          {
            video: "https://peertube.tv/w/2sCKSm6nRbFou4isvdYZRk",
            title: "300mph 480kmh | World's Fastest FPV Drone",
            channel: "Mike Bell",
            meta: "352K views • 1 year ago",
            duration: "14:52",
          },
          {
            video: "https://peertube.tv/videos/local?s=1",
            title: "300mph 480kmh | World's Fastest FPV Drone",
            channel: "Mike Bell",
            meta: "352K views • 1 year ago",
            duration: "14:52",
          },
        ]}
      />
      <ClubNewsSection
        className="col-span-full"
        items={newsQ.data}
        isLoading={newsQ.isLoading}
      />

      {/* Oyuncu Yönetimi */}
      <ClubPlayersSection
        className="col-span-full"
        players={playersQ.data ?? []}
        isLoading={playersQ.isLoading}
        onCreate={async (payload) => {
          await createPlayer.mutateAsync(payload);
          // mutate onSuccess içinde invalidate varsa buraya ekstra bir şey koymana gerek yok
        }}
      />

      {/* Başarılarımız / Kupalar */}
      <ClubTrophiesSection
        className="col-span-full"
        items={club.trophies ?? []}
        isLoading={clubQ.isLoading}
      />

      {/* Kadromuz / Personel */}
      <ClubStaffSection
        className="col-span-full"
        items={club.staffs ?? []}
        totalCount={club.staffCount}
        isLoading={clubQ.isLoading}
      />

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
