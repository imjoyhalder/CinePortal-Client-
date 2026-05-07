import type { Metadata } from "next";
import MoviesClient from "./movies-client";
import type { ApiResponse, Media } from "@/types";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const LIMIT   = 18;
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

async function getMovies(
  sp: Record<string, string | undefined>,
): Promise<{ movies: Media[]; meta: Meta }> {
  const params = new URLSearchParams();
  if (sp.search)            params.set("search",            sp.search);
  if (sp.type)              params.set("type",              sp.type);
  if (sp.genre)             params.set("genre",             sp.genre);
  if (sp.streamingPlatform) params.set("streamingPlatform", sp.streamingPlatform);
  if (sp.pricing)           params.set("pricing",           sp.pricing);
  if (sp.sortBy)            params.set("sortBy",            sp.sortBy);
  params.set("page",  sp.page ?? "1");
  params.set("limit", String(LIMIT));

  try {
    const res = await fetch(`${API_URL}/api/movies?${params}`, {
      cache: "no-store", // always fresh — fully dynamic
    });
    if (!res.ok) throw new Error("fetch failed");
    const json: ApiResponse<Media[]> = await res.json();
    return {
      movies: json.data ?? [],
      meta:   json.meta ?? { total: 0, page: 1, limit: LIMIT, totalPages: 0 },
    };
  } catch {
    return {
      movies: [],
      meta:   { total: 0, page: 1, limit: LIMIT, totalPages: 0 },
    };
  }
}

export const metadata: Metadata = {
  title: "Browse Movies & Series — CinePortal",
  description:
    "Discover thousands of movies and series. Filter by genre, platform, rating, and more.",
};

export default async function MoviesPage({ searchParams }: PageProps) {
  const sp              = await searchParams;
  const { movies, meta } = await getMovies(sp);

  return (
    <MoviesClient
      movies={movies}
      total={meta.total}
      totalPages={meta.totalPages}
      currentPage={Number(sp.page ?? "1")}
      filters={{
        search:   sp.search            ?? "",
        type:     sp.type              ?? "",
        genre:    sp.genre             ?? "",
        platform: sp.streamingPlatform ?? "",
        pricing:  sp.pricing           ?? "",
        sortBy:   sp.sortBy            ?? "",
      }}
    />
  );
}
