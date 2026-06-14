export const GENRES = [
  { label: "喜劇", slug: "comedy" },
  { label: "懸疑", slug: "mystery" },
  { label: "科幻", slug: "sci-fi" },
  { label: "愛情", slug: "romance" },
  { label: "紀錄", slug: "documentary" },
  { label: "動作", slug: "action" },
] as const;

export type GenreLabel = (typeof GENRES)[number]["label"];
export type GenreSlug = (typeof GENRES)[number]["slug"];

export const GENRE_LABELS: GenreLabel[] = GENRES.map((g) => g.label);

export const GENRE_LABEL_TO_SLUG = Object.fromEntries(
  GENRES.map((g) => [g.label, g.slug])
) as Record<GenreLabel, GenreSlug>;

export const GENRE_SLUG_TO_LABEL = Object.fromEntries(
  GENRES.map((g) => [g.slug, g.label])
) as Record<GenreSlug, GenreLabel>;
