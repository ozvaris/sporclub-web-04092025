'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error('Kayıt başarısız');
      // başarı → login sayfasına yönlendir
      router.replace('/login');
    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-2xl font-bold mb-6">Yeni Üyelik</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ad Soyad"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="E‑posta"
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Şifre"
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-blue-600 text-white rounded py-2 disabled:opacity-50"
        >
          {pending ? '...' : 'Kaydı tamamla'}
        </button>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </form>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <Link href="/" className="hover:underline">← Ana sayfa</Link>
        <Link href="/login" className="text-blue-600 hover:underline">Zaten hesabım var</Link>
      </div>
    </div>
  );
}
