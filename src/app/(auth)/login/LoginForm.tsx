// app/login/LoginForm.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi, apiErrorMessage } from "@/lib/fetchApi";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const qc = useQueryClient();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/profile"; // başarılı olunca buraya gidecek

  const login = useMutation({
    mutationKey: ["login"],
    mutationFn: async (body: { email: string; password: string }) => {
      // tek kapı: /api/login (cookie'yi server set eder)
      await fetchApi("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        traceName: "client:/api/login",
      });
    },
    onSuccess: async () => {
      // profil cache'ini yenile ve yönlendir
      await qc.invalidateQueries({ queryKey: ["profile"] });
      router.replace(next);
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await login.mutateAsync({ email, password });
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold mb-6">Giriş Yap</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Şifre"
          required
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {login.isPending ? "..." : "Giriş Yap"}
        </button>

        {login.isError && (
          <p className="text-red-500 text-center">
            {apiErrorMessage(login.error, "Giriş başarısız. Bilgilerini kontrol et.")}
          </p>
        )}
      </form>

      {/* Alt bağlantılar */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <Link href="/" className="hover:underline">
          ← Ana sayfa
        </Link>
        <div className="flex items-center gap-2">
          <span>Hesabın yok mu?</span>
          <Link href="/register" className="text-blue-600 hover:underline font-medium">
            Yeni üyelik
          </Link>
        </div>
      </div>
    </div>
  );
}
