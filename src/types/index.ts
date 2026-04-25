export type MediaType = "MOVIE" | "SERIES";
export type Pricing = "free" | "premium";
export type ReviewStatus = "PENDING" | "APPROVED" | "UNPUBLISHED";
export type Role = "USER" | "ADMIN";
export type SubscriptionPlan = "FREE" | "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "CANCELLED" | "PAST_DUE" | "INCOMPLETE";

export interface Media {
  id: string;
  title: string;
  synopsis: string;
  type: MediaType;
  genre: string[];
  releaseYear: number;
  director: string;
  cast: string[];
  streamingPlatforms: string[];
  posterUrl: string | null;
  trailerUrl: string | null;
  streamingUrl: string | null;
  pricing: Pricing;
  isPublished: boolean;
  createdAt: string;
  _count: { reviews: number; watchlist?: number };
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  tags: string[];
  hasSpoiler: boolean;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  userId: string;
  mediaId: string;
  user: { id: string; name: string; image: string | null };
  media?: { id: string; title: string; posterUrl: string | null; type: MediaType };
  _count: { likes: number; comments: number };
}

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
  replies?: Comment[];
  parentId?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
  emailVerified: boolean;
  createdAt: string;
  subscription?: Subscription | null;
  _count?: { reviews: number; watchlist?: number };
}

export interface Subscription {
  id?: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}

export interface WatchlistItem {
  id: string;
  createdAt: string;
  media: Pick<Media, "id" | "title" | "posterUrl" | "type" | "genre" | "releaseYear" | "pricing">;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

export interface FeaturedResponse {
  topRated: Media[];
  newlyAdded: Media[];
}

export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalMedia: number;
    totalReviews: number;
    pendingReviews: number;
    activeSubscriptions: number;
  };
  recentReviews: (Review & { user: { name: string; email: string } })[];
  topRatedMedia: (Media & { averageRating: number })[];
}
