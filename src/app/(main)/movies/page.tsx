import type { Metadata } from "next";
import MoviesClient from "./movies-client";

export const metadata: Metadata = {
  title: "Browse Movies & Series",
  description: "Discover thousands of movies and series. Filter by genre, rating, and more.",
};

export default function MoviesPage() {
  return <MoviesClient />;
}
