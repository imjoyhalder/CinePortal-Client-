"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import { MdMovieCreation } from "react-icons/md";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { ApiResponse, Media } from "@/types";
import AdminMovieForm from "@/components/admin/admin-movie-form";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Media | null>(null);

  async function loadMovies() {
    setLoading(true);
    try {
      const data = await api.get<ApiResponse<Media[]>>(`/admin/media?page=${page}&limit=20`);
      setMovies(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch { setMovies([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadMovies(); }, [page]);

  async function togglePublish(movie: Media) {
    try {
      await api.patch(`/movies/${movie.id}`, { isPublished: !movie.isPublished });
      setMovies((prev) => prev.map((m) => m.id === movie.id ? { ...m, isPublished: !m.isPublished } : m));
      toast.success(`${movie.isPublished ? "Unpublished" : "Published"} ${movie.title}`);
    } catch { toast.error("Failed to update"); }
  }

  async function deleteMovie(movie: Media) {
    if (!confirm(`Delete "${movie.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/movies/${movie.id}`);
      setMovies((prev) => prev.filter((m) => m.id !== movie.id));
      toast.success("Media deleted");
    } catch { toast.error("Failed to delete"); }
  }

  if (showForm || editing) {
    return (
      <AdminMovieForm
        movie={editing ?? undefined}
        onSuccess={() => { setShowForm(false); setEditing(null); loadMovies(); }}
        onCancel={() => { setShowForm(false); setEditing(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Movies &amp; Series</h1>
          <p className="text-sm text-muted-foreground">{total} titles</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(true)}>
          <FiPlus className="w-4 h-4" /> Add Media
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-2/3 bg-card animate-pulse rounded-xl border border-border/50" />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-16">
          <MdMovieCreation className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No media yet.</p>
          <Button className="mt-4 gap-2" onClick={() => setShowForm(true)}><FiPlus className="w-4 h-4" /> Add First Movie</Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie) => (
            <Card key={movie.id} className="group overflow-hidden border-border/50">
              <div className="relative aspect-2/3 bg-muted">
                {movie.posterUrl ? (
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <MdMovieCreation className="w-10 h-10 text-muted-foreground/30" />
                  </div>
                )}
                {!movie.isPublished && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="secondary" className="text-xs">Unpublished</Badge>
                  </div>
                )}
                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => setEditing(movie)}>
                    <FiEdit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="icon" variant="secondary" className="w-8 h-8" onClick={() => togglePublish(movie)}>
                    {movie.isPublished ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
                  </Button>
                  <Button size="icon" variant="destructive" className="w-8 h-8" onClick={() => deleteMovie(movie)}>
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium line-clamp-1">{movie.title}</p>
                <p className="text-xs text-muted-foreground">{movie.releaseYear} · {movie.type}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {Math.ceil(total / 20) > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 20)}</span>
          <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
