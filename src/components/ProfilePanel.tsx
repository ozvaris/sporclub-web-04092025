// src/components/ProfilePanel.tsx
'use client';

import { useProfileQuery } from '@/features/auth/useProfileQuery';
import { useQuery } from '@tanstack/react-query';
import type { User } from '@/types';

export default function ProfilePanel() {
    const { data, isLoading, isError } = useProfileQuery();

    if (isLoading) {
        return <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />;
    }
    if (isError || !data) {
        return <div className="text-red-600">Profili yüklerken sorun oldu.</div>;
    }

    return (
        <div className="rounded-xl border p-4 bg-white space-y-2">
            <p><span className="font-medium">Ad:</span> {data.name}</p>
            <p><span className="font-medium">E‑posta:</span> {data.email}</p>
        </div>
    );
}
