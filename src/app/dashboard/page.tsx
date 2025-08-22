// src/app/dashboard/page.tsx
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { User } from '@/types';

export default async function DashboardPage() {
  const access = (await cookies()).get('access')?.value;
  if (!access) redirect('/login');

  const res = await fetch(process.env.BACKEND_URL + '/users/profile', {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!res.ok) redirect('/login');

  const user = (await res.json()) as User;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Welcome back, {user.name}</h1>
      <p>Email: {user.email}</p>
    </div>
  );
}
