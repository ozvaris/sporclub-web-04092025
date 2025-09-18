// src/features/clubs/types.ts
export type ClubFacility = { src: string; alt?: string };

export type Club = {
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
  staffCount?: number; // varsa backend'ten gelir; yoksa UI'da staffs?.length ile türetiriz

};

export type ClubNews = {
  id: number;
  title: string;
  summary: string;
  thumbnail?: string | null;     // ← eklendi
  published_at: string; // ISO
};

export type ClubPlayer = {
  id: number;
  name: string;
  position?: string | null;
  age?: number | null;
  defense?: number | null;
  offense?: number | null;
  cardImage?: string | null;
};

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
  avatar?: string; // opsiyonel görsel
}
