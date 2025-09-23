// src/server/services/clubs.ts
import 'server-only';
import { authFetchApi } from '@/lib/authFetchApi';

/**
 * SERVER-ONLY data access layer (CLUBS)
 * SSR (RSC) tarafında /api'ya fetch atmaz; doğrudan backend'e gider.
 * API route'lar da aynı fonksiyonları kullanır.
 */

export interface Trophy {
  id: string;
  year: number;
  title: string;
  competition?: string;
  level?: "International" | "National" | "Regional" | "Local";
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  avatar?: string;
}

export interface ClubFacility {
  src: string;
  alt?: string;
}

export interface ClubResponse {
  id: number;
  slug: string;
  name: string;
  league?: string | null;
  founded?: number | null;
  history?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  facilities?: ClubFacility[];
  trophies?: Trophy[];
  staffs?: Staff[];
  staffCount?: number;
}
export interface ClubPostsResponse {
  id: number;
  title: string;
  summary: string;
  thumbnail?: string | null;
  published_at: string; // ISO
}
export interface ClubPlayerResponse {
  id: number;
  name: string;
  position?: string | null;
  age?: number | null;
  defense?: number | null;
  offense?: number | null;
  cardImage?: string | null;
}

export type Club = ClubResponse;           // İstersen tipleri projendeki modellere göre daralt
export type ClubPlayer = ClubPlayerResponse;
export type ClubPost = ClubPostsResponse;

// ### Club ###
export async function getClub(slug: string): Promise<Club> {
  return authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}`, {
    traceName: 'svc:clubs.getClub',
  });
}

export async function updateClub(slug: string, body: unknown): Promise<Club> {
  return authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    traceName: 'svc:clubs.updateClub',
  });
}

export async function deleteClub(slug: string): Promise<{ ok: true }> {
  await authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
    traceName: 'svc:clubs.deleteClub',
  });
  return { ok: true };
}

// ### Players ###
export async function listClubPlayers(slug: string): Promise<ClubPlayer[]> {
  return authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}/players`, {
    traceName: 'svc:clubs.listClubPlayers',
  });
}

export async function addClubPlayer(slug: string, body: unknown): Promise<ClubPlayer> {
  return authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}/players`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    traceName: 'svc:clubs.addClubPlayer',
  });
}

export async function patchClubPlayer(slug: string, body: unknown): Promise<ClubPlayer> {
  return authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}/players`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    traceName: 'svc:clubs.patchClubPlayer',
  });
}

// ### Posts ###
export async function listClubPosts(slug: string): Promise<ClubPost[]> {
  // Mevcut API'n burada /admin/clubs/:slug/posts endpoint'ini kullanıyor. :contentReference[oaicite:2]{index=2}
  return authFetchApi(`/admin/clubs/${encodeURIComponent(slug)}/posts`, {
    traceName: 'svc:clubs.listClubPosts',
  });
}
