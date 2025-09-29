// src/features/clubs/api.ts
import { fetchApi } from "@/lib/fetchApi";
import type { Club, ClubPosts, ClubPlayer } from "./types";

export const getClub = (slug: string) =>
  fetchApi<Club>(`/api/clubs/${slug}`, { traceName: "feature:getClub" });

export const getClubPosts = (slug: string) =>
  fetchApi<ClubPosts[]>(`/api/clubs/${slug}/news`, { traceName: "feature:getClubPosts" });

export const getClubPlayers = (slug: string) =>
  fetchApi<ClubPlayer[]>(`/api/clubs/${slug}/players`, { traceName: "feature:getClubPlayers" });

export const createClubPlayer = (slug: string, body: Partial<ClubPlayer>) =>
  fetchApi(`/api/clubs/${slug}/players`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    traceName: "feature:createClubPlayer",
  });
