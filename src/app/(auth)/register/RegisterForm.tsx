// src/app/(auth)/register/RegisterForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, apiErrorMessage } from "@/lib/fetchApi"; // mevcut yardımcılar
//                                   ↑ mevcut projedeki import noktasıyla aynı  :contentReference[oaicite:3]{index=3}

type Privacy = "private" | "public";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [privacy, setPrivacy] = useState<Privacy>("private"); // ← YENİ

  const router = useRouter();
  const qc = useQueryClient();
  const sp = useSearchParams();
  const next = sp.get("next") || "/profile";

  const registerMut = useMutation({
    mutationKey: ["register"],
    mutationFn: async (body: {
      name: string;
      email: string;
      password: string;
      passwordConfirm: string
      privacy: Privacy; // ← YENİ
    }) => {
      // BFF: /api/register → backend'e paslar (auth/register)  :contentReference[oaicite:4]{index=4}
      await fetchApi("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        traceName: "client:/api/register",
      });
    },
    onSuccess: async () => {
      // Opsiyon A: kayıt sonrası otomatik giriş denemesi
      await fetchApi("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw }),
        cache: "no-store",
        traceName: "client:/api/login#after-register",
      }).catch(() => {});

      await qc.invalidateQueries({ queryKey: ["profile"] });
      router.replace(next);
    },
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pw.length < 8) {
      alert("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (pw !== pw2) {
      alert("Şifreler uyuşmuyor.");
      return;
    }
    registerMut.mutate({ name, email, password: pw, passwordConfirm: pw2, privacy }); // ← YENİ
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold mb-6">Yeni Üyelik</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full p-2 border rounded"
            placeholder="Örn. Admin Kullanıcısı"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">E-posta</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full p-2 border rounded"
            placeholder="ornek@mail.com"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Şifre */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded"
              placeholder="En az 8 karakter"
            />
          </div>

          {/* Şifre (Tekrar) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Şifre (Tekrar)</label>
            <input
              type="password"
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              required
              className="mt-1 w-full p-2 border rounded"
              placeholder="Şifreni tekrar yaz"
            />
          </div>
        </div>

        {/* GİZLİLİK — ProfilePanel ile aynı etiket/opsiyonlar */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Gizlilik</label>
          <select
            value={privacy}
            onChange={(e) => {alert(e.target.value); setPrivacy(e.target.value as Privacy)}}
            className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="private">Özel</option>
            <option value="public">Herkese açık</option>
          </select>
        </div>
        {/* Yukarıdaki sınıflar/etiket metinleri ProfilePanel'deki “Gizlilik” alanıyla eşleşir. :contentReference[oaicite:5]{index=5} */}

        <button
          type="submit"
          disabled={registerMut.isPending}
          className="w-full bg-emerald-600 text-white rounded py-2 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {registerMut.isPending ? (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          ) : null}
          Kayıt Ol
        </button>

        {registerMut.isError && (
          <p className="text-red-500 text-center">
            {apiErrorMessage(registerMut.error, "Kayıt başarısız. Bilgileri kontrol et.")}
          </p>
        )}
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <Link href="/" className="hover:underline">← Ana sayfa</Link>
        <div className="flex items-center gap-2">
          <span>Hesabın var mı?</span>
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-blue-600 hover:underline font-medium">
            Giriş yap
          </Link>
        </div>
      </div>
    </div>
  );
}
