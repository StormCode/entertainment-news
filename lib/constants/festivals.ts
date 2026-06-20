export const FESTIVALS = [
  { label: "坎城影展", slug: "cannes" },
  { label: "威尼斯影展", slug: "venice" },
  { label: "柏林影展", slug: "berlin" },
  { label: "多倫多影展", slug: "tiff" },
  { label: "日舞影展", slug: "sundance" },
  { label: "釜山影展", slug: "busan" },
  { label: "盧卡諾影展", slug: "locarno" },
  { label: "鹿特丹影展", slug: "rotterdam" },
  { label: "金馬影展", slug: "golden-horse" },
  { label: "台北電影節", slug: "taipei-film-festival" },
  { label: "香港電影節", slug: "hkiff" },
  { label: "聖丹斯影展", slug: "sundance-festival" },
  { label: "紐約影展", slug: "nyff" },
  { label: "首爾影展", slug: "siff" },
] as const;

export type FestivalLabel = (typeof FESTIVALS)[number]["label"];
export type FestivalSlug = (typeof FESTIVALS)[number]["slug"];

export const FESTIVAL_LABEL_TO_SLUG = Object.fromEntries(
  FESTIVALS.map((f) => [f.label, f.slug])
) as Record<FestivalLabel, FestivalSlug>;

export const FESTIVAL_SLUG_TO_LABEL = Object.fromEntries(
  FESTIVALS.map((f) => [f.slug, f.label])
) as Record<FestivalSlug, FestivalLabel>;
