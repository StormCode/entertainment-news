export interface TmdbFilm {
  tmdbId: number;
  title: string;
  originalTitle: string;
  director: string | null;
  runtimeMin: number | null;
  releaseYear: number | null;
  backdropPath: string | null;
  posterPath: string | null;
  rawJson: string;
}

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function tmdbId(url: string): number | null {
  const m = url.match(/\/movie\/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

export async function fetchTmdbFilm(urlOrId: string): Promise<TmdbFilm | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error("TMDB_API_KEY not set");

  const id = tmdbId(urlOrId) ?? (isNaN(Number(urlOrId)) ? null : Number(urlOrId));
  if (!id) return null;

  const [movieRes, creditsRes] = await Promise.all([
    fetch(`${TMDB_BASE}/movie/${id}?api_key=${apiKey}&language=zh-TW`),
    fetch(`${TMDB_BASE}/movie/${id}/credits?api_key=${apiKey}`),
  ]);

  if (!movieRes.ok) return null;

  const movie = await movieRes.json();
  const credits = creditsRes.ok ? await creditsRes.json() : { crew: [] };

  const director =
    credits.crew?.find((c: { job: string; name: string }) => c.job === "Director")?.name ?? null;

  return {
    tmdbId: id,
    title: movie.title,
    originalTitle: movie.original_title,
    director,
    runtimeMin: movie.runtime ?? null,
    releaseYear: movie.release_date ? parseInt(movie.release_date.slice(0, 4), 10) : null,
    backdropPath: movie.backdrop_path
      ? `${TMDB_IMAGE_BASE}/original${movie.backdrop_path}`
      : null,
    posterPath: movie.poster_path
      ? `${TMDB_IMAGE_BASE}/w500${movie.poster_path}`
      : null,
    rawJson: JSON.stringify(movie),
  };
}
