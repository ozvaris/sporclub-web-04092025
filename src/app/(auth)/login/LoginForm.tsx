// src/app/(auth)/login/LoginForm.tsx
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
  const next = sp.get("next") || "/profile";

  const login = useMutation({
    mutationKey: ["login"],
    mutationFn: async (body: { email: string; password: string }) => {
      // BFF: /api/login -> cookie'yi server set eder
      await fetchApi("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
        traceName: "client:/api/login",
      });
    },
    onSuccess: async () => {
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

        <div>
          <label className="block text-sm font-medium text-gray-700">Şifre</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full p-2 border rounded"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50 inline-flex items-center justify-center gap-2"
        >
          {login.isPending && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          )}
          Giriş Yap
        </button>

        {login.isError && (
          <p className="text-red-500 text-center">
            {apiErrorMessage(login.error, "Giriş başarısız. Bilgilerini kontrol et.")}
          </p>
        )}
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <Link href="/" className="hover:underline">← Ana sayfa</Link>
        <div className="flex items-center gap-2">
          <span>Hesabın yok mu?</span>
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-blue-600 hover:underline font-medium"
          >
            Yeni üyelik
          </Link>
        </div>
      </div>
    </div>
  );
}
