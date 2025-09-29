// src/features/news/types.ts
// ———————————————————————————————————————————————————————————————
// Generic News tipleri (PostScope + PostsType + Article genişletmeleri)

export enum PostScope {
  GLOBAL = "global",
  CLUB = "club",
  ATHLETE = "athlete",
}

export enum PostsType {
  VIDEO = "video",
  IMAGE = "image",
  ARTICLE = "article",
  SHORT_MESSAGE = "short_message",
}

export type PostOwnerClub = {
  slug: string;
  name: string;
  avatar?: string | null;
};

export type PostOwnerAthlete = {
  slug: string;
  name: string;
  avatar?: string | null;
};

export type PostBase = {
  id: string | number;
  slug?: string | null;           // bazı sistemlerde var
  scope: PostScope;
  type: PostsType;
  title: string;
  summary?: string | null;
  published_at?: string | null;   // ISO
  updated_at?: string | null;     // ISO
  author_name?: string | null;
  club?: PostOwnerClub | null;
  athlete?: PostOwnerAthlete | null;
};

export type PostArticle = PostBase & {
  type: PostsType.ARTICLE;
  cover_url?: string | null;          // hero (varsa)
  thumbnail?: string | null;      // küçük görsel (listeler)
  tags?: string[] | null;
  categories?: string[] | null;
  content_html?: string | null;   // html dönen backendler için
  content_md?: string | null;     // markdown dönen backendler için
};
