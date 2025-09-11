// src/components/ProfilePanel.tsx
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi, apiErrorMessage } from '@/lib/fetchApi';

type ProfileDto = {
  id: number;
  name: string;
  email: string;
  status: string;                 // örn. 'active'
  privacy: 'private' | 'public' | string;
};

type FormState = Pick<ProfileDto, 'name' | 'privacy'>;

export default function ProfilePanel() {
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery<ProfileDto>({
    queryKey: ['profile'],
    queryFn: () => fetchApi<ProfileDto>('/api/profile'),
    staleTime: 5_000,
  });

  const [form, setForm] = React.useState<FormState>({ name: '', privacy: 'private' });
  const [pw, setPw] = React.useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [msg, setMsg] = React.useState<{ ok?: string; err?: string }>({});

  React.useEffect(() => {
    if (data) setForm({ name: data.name ?? '', privacy: (data.privacy as any) ?? 'private' });
  }, [data]);

  const mUpdate = useMutation({
    mutationFn: (payload: Partial<FormState>) =>
      fetchApi('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        traceName: 'client:/api/profile#PUT',
      }),
    onSuccess: async () => {
      setMsg({ ok: 'Profil güncellendi.' });
      await qc.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (e) => setMsg({ err: apiErrorMessage(e, 'Güncelleme başarısız.') }),
  });

  const mPassword = useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      fetchApi('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        traceName: 'client:/api/profile/password#POST',
      }),
    onSuccess: () => setMsg({ ok: 'Parola güncellendi.' }),
    onError: (e) => setMsg({ err: apiErrorMessage(e, 'Parola değiştirilemedi.') }),
  });

  const mDelete = useMutation({
    mutationFn: () =>
      fetchApi('/api/profile', {
        method: 'DELETE',
        traceName: 'client:/api/profile#DELETE',
      }),
    onSuccess: () => (window.location.href = '/login'),
    onError: (e) => setMsg({ err: apiErrorMessage(e, 'Hesap silinemedi.') }),
  });

  const onSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({});
    mUpdate.mutate({ name: form.name, privacy: form.privacy });
  };

  const onChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({});
    if (!pw.newPassword || pw.newPassword.length < 8) return setMsg({ err: 'Yeni parola en az 8 karakter.' });
    if (pw.newPassword !== pw.confirm) return setMsg({ err: 'Parolalar uyuşmuyor.' });
    mPassword.mutate({ currentPassword: pw.currentPassword, newPassword: pw.newPassword });
  };

  const onDelete = () => {
    setMsg({});
    if (window.confirm('Hesabınızı kalıcı olarak silmek istiyor musunuz?')) mDelete.mutate();
  };

  if (isLoading) return <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />;
  if (isError || !data) return <div className="text-red-600">Profili yüklerken sorun oldu.</div>;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Profil Kartı */}
      <div className="rounded-2xl border p-5 md:p-6 bg-white">
        <h2 className="text-lg md:text-xl font-semibold">Profil Bilgileri</h2>
        <p className="text-sm text-gray-600 mt-1">Adını ve gizlilik ayarını güncelleyebilirsin.</p>

        {msg.ok && <div className="mt-4 rounded-md bg-green-50 border border-green-200 text-green-700 px-3 py-2 text-sm">{msg.ok}</div>}
        {msg.err && <div className="mt-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm">{msg.err}</div>}

        <form onSubmit={onSaveProfile} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Ad Soyad</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Örn. Admin Kullanıcısı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">E-posta</label>
            <input
              type="email"
              value={data.email}
              disabled
              className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">E-posta değişikliği için yöneticiye başvurmanız gerekebilir.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Durum</label>
              <input
                type="text"
                value={data.status ?? 'unknown'}
                disabled
                className="mt-1 block w-full rounded-lg border-gray-200 bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Gizlilik</label>
              <select
                value={form.privacy}
                onChange={(e) => setForm((s) => ({ ...s, privacy: e.target.value as 'private' | 'public' }))}
                className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="private">Özel</option>
                <option value="public">Herkese açık</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={mUpdate.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {mUpdate.isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              Değişiklikleri Kaydet
            </button>
          </div>
        </form>
      </div>

      {/* Güvenlik Kartı */}
      <div className="rounded-2xl border p-5 md:p-6 bg-white">
        <h2 className="text-lg md:text-xl font-semibold">Güvenlik</h2>
        <p className="text-sm text-gray-600 mt-1">Parolanı değiştirerek hesabını koru.</p>

        <form onSubmit={onChangePassword} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mevcut Parola</label>
            <input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw((s) => ({ ...s, currentPassword: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Parola</label>
            <input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw((s) => ({ ...s, newPassword: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="new-password"
              placeholder="En az 8 karakter"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Yeni Parola (Tekrar)</label>
            <input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))}
              className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={mPassword.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-60"
          >
            {mPassword.isPending && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            Parolayı Güncelle
          </button>
        </form>

        <div className="mt-8 border-t pt-6">
          <h3 className="text-sm font-semibold text-red-700">Tehlikeli Bölge</h3>
          <p className="text-sm text-gray-600 mt-1">
            Hesabını silersen tüm verilerin kalıcı olarak kaldırılır ve bu işlem geri alınamaz.
          </p>
          <button
            onClick={onDelete}
            disabled={mDelete.isPending}
            className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-300 px-4 py-2 text-red-700 hover:bg-red-50 disabled:opacity-60"
          >
            {mDelete.isPending && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            )}
            Hesabı Sil
          </button>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="md:col-span-2 rounded-2xl border p-5 md:p-6 bg-white">
        <h2 className="text-lg md:text-xl font-semibold">Hesap Özeti</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">Kullanıcı ID</div>
            <div className="font-medium">{data.id}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">E-posta</div>
            <div className="font-medium">{data.email}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">Durum</div>
            <div className="font-medium capitalize">{data.status}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">Gizlilik</div>
            <div className="font-medium capitalize">{form.privacy}</div>
          </div>
          <div className="rounded-lg border p-3">
            <div className="text-gray-500">Ad</div>
            <div className="font-medium">{form.name || '-'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
