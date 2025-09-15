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
};

export type ClubNews = {
  id: number;
  title: string;
  summary: string;
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
