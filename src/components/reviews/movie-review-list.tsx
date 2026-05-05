// "use client";

// import { useState } from "react";
// import { FiCheck, FiEyeOff, FiTrash2, FiMessageSquare } from "react-icons/fi";
// import { Button } from "@/components/ui/button";
// import ReviewCard from "./review-card";
// import { useSession } from "@/lib/auth-client";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import type { Review } from "@/types";

// interface MovieReviewListProps {
//   initialReviews: Review[];
//   mediaId: string;
// }

// export default function MovieReviewList({ initialReviews, mediaId }: MovieReviewListProps) {
//   const { data: session } = useSession();
//   const [reviews, setReviews] = useState<Review[]>(initialReviews);

//   const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

//   async function moderate(reviewId: string, status: "APPROVED" | "UNPUBLISHED") {
//     try {
//       await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });
//       setReviews((prev) =>
//         prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
//       );
//       toast.success(`Review ${status === "APPROVED" ? "approved" : "unpublished"}`);
//     } catch {
//       toast.error("Failed to update review");
//     }
//   }

//   async function adminDelete(reviewId: string) {
//     if (!confirm("Delete this review permanently? This cannot be undone.")) return;
//     try {
//       await api.delete(`/reviews/${reviewId}`);
//       setReviews((prev) => prev.filter((r) => r.id !== reviewId));
//       toast.success("Review deleted");
//     } catch {
//       toast.error("Failed to delete review");
//     }
//   }

//   if (reviews.length === 0) {
//     return (
//       <div className="text-center py-12 text-muted-foreground">
//         <FiMessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
//         <p>No reviews yet. Be the first to review!</p>
//       </div>
//     );
//   }

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {reviews.map((review) => (
//         <div key={review.id} className="space-y-1.5">
//           <ReviewCard review={review} />
//           {isAdmin && (
//             <div className="flex items-center gap-1.5 px-1">
//               {review.status !== "APPROVED" && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="h-7 text-xs gap-1 border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/60"
//                   onClick={() => moderate(review.id, "APPROVED")}
//                 >
//                   <FiCheck className="w-3 h-3" /> Approve
//                 </Button>
//               )}
//               {review.status !== "UNPUBLISHED" && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
//                   onClick={() => moderate(review.id, "UNPUBLISHED")}
//                 >
//                   <FiEyeOff className="w-3 h-3" /> Unpublish
//                 </Button>
//               )}
//               <Button
//                 size="sm"
//                 variant="outline"
//                 className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/60"
//                 onClick={() => adminDelete(review.id)}
//               >
//                 <FiTrash2 className="w-3 h-3" /> Delete
//               </Button>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }




// "use client";

// import { useState } from "react";
// import { FiCheck, FiEyeOff, FiTrash2, FiMessageSquare, FiShield } from "react-icons/fi";
// import { Button } from "@/components/ui/button";
// import ReviewCard from "./review-card";
// import { useSession } from "@/lib/auth-client";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import type { Review } from "@/types";

// interface MovieReviewListProps {
//   initialReviews: Review[];
//   mediaId: string;
// }

// export default function MovieReviewList({ initialReviews, mediaId }: MovieReviewListProps) {
//   const { data: session } = useSession();
//   const [reviews, setReviews] = useState<Review[]>(initialReviews);

//   const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

//   async function moderate(reviewId: string, status: "APPROVED" | "UNPUBLISHED") {
//     try {
//       await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });
//       setReviews((prev) =>
//         prev.map((r) => (r.id === reviewId ? { ...r, status } : r))
//       );
//       toast.success(`Review ${status === "APPROVED" ? "approved" : "unpublished"}`);
//     } catch {
//       toast.error("Failed to update review");
//     }
//   }

//   async function adminDelete(reviewId: string) {
//     if (!confirm("Delete this review permanently? This cannot be undone.")) return;
//     try {
//       await api.delete(`/reviews/${reviewId}`);
//       setReviews((prev) => prev.filter((r) => r.id !== reviewId));
//       toast.success("Review deleted");
//     } catch {
//       toast.error("Failed to delete review");
//     }
//   }

//   if (reviews.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-24 bg-secondary/5 rounded-[3rem] border border-dashed border-white/10">
//         <FiMessageSquare className="w-16 h-16 text-muted-foreground mb-4 opacity-10" />
//         <h3 className="text-xl font-bold opacity-40">Silence is golden.</h3>
//         <p className="text-muted-foreground">Be the first to break the ice!</p>
//       </div>
//     );
//   }

//   return (
//     <div className="columns-1 md:columns-2 gap-6 space-y-6">
//       {reviews.map((review) => (
//         <div key={review.id} className="break-inside-avoid group relative">
//           <div className="transition-all duration-300 hover:-translate-y-1">
//             <ReviewCard review={review} />
//           </div>

//           {isAdmin && (
//             <div className="mt-3 flex items-center justify-between gap-2 px-4 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
//               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
//                 <FiShield className="w-3 h-3" /> Admin Tools
//               </div>
//               <div className="flex items-center gap-1.5">
//                 {review.status !== "APPROVED" && (
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8 rounded-lg text-green-400 hover:bg-green-500/10 hover:text-green-300"
//                     onClick={() => moderate(review.id, "APPROVED")}
//                     title="Approve"
//                   >
//                     <FiCheck className="w-4 h-4" />
//                   </Button>
//                 )}
//                 {review.status !== "UNPUBLISHED" && (
//                   <Button
//                     size="icon"
//                     variant="ghost"
//                     className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-white/5"
//                     onClick={() => moderate(review.id, "UNPUBLISHED")}
//                     title="Unpublish"
//                   >
//                     <FiEyeOff className="w-4 h-4" />
//                   </Button>
//                 )}
//                 <Button
//                   size="icon"
//                   variant="ghost"
//                   className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10"
//                   onClick={() => adminDelete(review.id)}
//                   title="Delete"
//                 >
//                   <FiTrash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           )}

//           {/* Status Badge for Admins only */}
//           {isAdmin && (
//             <div className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${review.status === "APPROVED" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
//               }`}>
//               {review.status}
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// }
// "use client";

// "use client";

// import { useState } from "react";
// import {
//   FiCheck,
//   FiTrash2,
//   FiEyeOff,
//   FiChevronDown,
//   FiChevronUp,
//   FiMessageCircle,
//   FiShield,
// } from "react-icons/fi";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useSession } from "@/lib/auth-client";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import ReviewCard from "./review-card";
// import type { Review } from "@/types";

// interface MovieReviewListProps {
//   initialReviews: Review[];
//   mediaId: string;
// }

// export default function MovieReviewList({
//   initialReviews,
// }: MovieReviewListProps) {
//   const { data: session } = useSession();
//   const [reviews, setReviews] = useState<Review[]>(initialReviews);
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const isAdmin =
//     (session?.user as { role?: string } | undefined)?.role === "ADMIN";

//   const toggleExpand = (id: string) => {
//     setExpandedId((prev) => (prev === id ? null : id));
//   };

//   async function moderate(
//     reviewId: string,
//     status: "APPROVED" | "UNPUBLISHED"
//   ) {
//     try {
//       await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });

//       setReviews((prev) =>
//         prev.map((review) =>
//           review.id === reviewId ? { ...review, status } : review
//         )
//       );

//       toast.success(
//         `Review ${
//           status === "APPROVED" ? "approved successfully" : "unpublished"
//         }`
//       );
//     } catch {
//       toast.error("Failed to update review");
//     }
//   }

//   async function adminDelete(reviewId: string) {
//     if (!confirm("Delete this review permanently?")) return;

//     try {
//       await api.delete(`/reviews/${reviewId}`);
//       setReviews((prev) => prev.filter((review) => review.id !== reviewId));
//       toast.success("Review deleted");
//     } catch {
//       toast.error("Failed to delete review");
//     }
//   }

//   if (!reviews.length) {
//     return (
//       <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-xl p-16 text-center">
//         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
//           <FiMessageCircle className="h-7 w-7 text-muted-foreground" />
//         </div>

//         <h3 className="mt-5 text-lg font-semibold">No Reviews Yet</h3>
//         <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
//           Be the first to share your thoughts about this movie.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <section className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold tracking-tight">Community Reviews</h2>
//           <p className="text-sm text-muted-foreground mt-1">
//             {reviews.length} review{reviews.length > 1 ? "s" : ""}
//           </p>
//         </div>

//         {isAdmin && (
//           <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
//             <FiShield className="h-4 w-4" />
//             Admin moderation enabled
//           </div>
//         )}
//       </div>

//       {/* Review Grid */}
//       <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
//         {reviews.map((review) => {
//           const expanded = expandedId === review.id;

//           return (
//             <article
//               key={review.id}
//               className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
//             >
//               {/* Review Body */}
//               <div className="relative p-5">
//                 <div
//                   className={`overflow-hidden transition-all duration-300 ${
//                     expanded ? "max-h-[1200px]" : "max-h-[240px]"
//                   }`}
//                 >
//                   <ReviewCard review={review} />
//                 </div>

//                 {!expanded && (
//                   <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
//                 )}
//               </div>

//               {/* Footer */}
//               <div className="border-t border-white/5 px-4 py-3">
//                 <button
//                   onClick={() => toggleExpand(review.id)}
//                   className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-white"
//                 >
//                   {expanded ? (
//                     <>
//                       Collapse <FiChevronUp />
//                     </>
//                   ) : (
//                     <>
//                       Read Review <FiChevronDown />
//                     </>
//                   )}
//                 </button>
//               </div>

//               {/* Admin Controls */}
//               {isAdmin && (
//                 <div className="border-t border-white/5 px-4 py-3">
//                   <div className="flex items-center justify-between">
//                     <Badge
//                       variant="outline"
//                       className={`text-[10px] uppercase tracking-wide ${
//                         review.status === "APPROVED"
//                           ? "border-emerald-500/20 text-emerald-400"
//                           : "border-yellow-500/20 text-yellow-400"
//                       }`}
//                     >
//                       {review.status}
//                     </Badge>

//                     <div className="flex gap-2">
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 rounded-xl text-emerald-400 hover:bg-emerald-500/10"
//                         onClick={() => moderate(review.id, "APPROVED")}
//                       >
//                         <FiCheck size={14} />
//                       </Button>

//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 rounded-xl text-zinc-400 hover:bg-white/5"
//                         onClick={() => moderate(review.id, "UNPUBLISHED")}
//                       >
//                         <FiEyeOff size={14} />
//                       </Button>

//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 rounded-xl text-red-400 hover:bg-red-500/10"
//                         onClick={() => adminDelete(review.id)}
//                       >
//                         <FiTrash2 size={14} />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </article>
//           );
//         })}
//       </div>
//     </section>
//   );
// }

// "use client";

// import { useState } from "react";
// import {
//   FiCheck,
//   FiTrash2,
//   FiEyeOff,
//   FiChevronDown,
//   FiChevronUp,
//   FiMessageCircle,
//   FiShield,
// } from "react-icons/fi";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { useSession } from "@/lib/auth-client";
// import { api } from "@/lib/api";
// import { toast } from "sonner";
// import ReviewCard from "./review-card";
// import type { Review } from "@/types";

// interface MovieReviewListProps {
//   initialReviews: Review[];
//   mediaId: string;
// }

// export default function MovieReviewList({
//   initialReviews,
// }: MovieReviewListProps) {
//   const { data: session } = useSession();
//   const [reviews, setReviews] = useState<Review[]>(initialReviews);
//   const [expandedId, setExpandedId] = useState<string | null>(null);

//   const isAdmin =
//     (session?.user as { role?: string } | undefined)?.role === "ADMIN";

//   const toggleExpand = (id: string) => {
//     setExpandedId((prev) => (prev === id ? null : id));
//   };

//   async function moderate(
//     reviewId: string,
//     status: "APPROVED" | "UNPUBLISHED"
//   ) {
//     try {
//       await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });

//       setReviews((prev) =>
//         prev.map((review) =>
//           review.id === reviewId ? { ...review, status } : review
//         )
//       );

//       toast.success(
//         `Review ${
//           status === "APPROVED" ? "approved successfully" : "unpublished"
//         }`
//       );
//     } catch {
//       toast.error("Failed to update review");
//     }
//   }

//   async function adminDelete(reviewId: string) {
//     if (!confirm("Delete this review permanently?")) return;

//     try {
//       await api.delete(`/reviews/${reviewId}`);
//       setReviews((prev) => prev.filter((review) => review.id !== reviewId));
//       toast.success("Review deleted");
//     } catch {
//       toast.error("Failed to delete review");
//     }
//   }

//   if (!reviews.length) {
//     return (
//       <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-xl p-16 text-center">
//         <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
//           <FiMessageCircle className="h-7 w-7 text-muted-foreground" />
//         </div>

//         <h3 className="mt-5 text-lg font-semibold">No Reviews Yet</h3>
//         <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
//           Be the first to share your thoughts about this movie.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <section className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-xl font-bold tracking-tight">
//             Community Reviews
//           </h2>
//           <p className="mt-1 text-sm text-muted-foreground">
//             {reviews.length} review{reviews.length > 1 ? "s" : ""}
//           </p>
//         </div>

//         {isAdmin && (
//           <div className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-xs text-amber-300">
//             <FiShield className="h-4 w-4" />
//             Admin moderation enabled
//           </div>
//         )}
//       </div>

//       {/* Review Grid */}
//       <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
//         {reviews.map((review) => {
//           const expanded = expandedId === review.id;

//           return (
//             <article
//               key={review.id}
//               className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl"
//             >
//               {/* Review Content */}
//               <div className="relative p-5">
//                 <div
//                   className={`transition-all duration-300 ${
//                     expanded
//                       ? "max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
//                       : "max-h-[240px] overflow-hidden"
//                   }`}
//                 >
//                   <ReviewCard review={review} />
//                 </div>

//                 {!expanded && (
//                   <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent" />
//                 )}
//               </div>

//               {/* Expand Button */}
//               <div className="border-t border-white/5 px-4 py-3">
//                 <button
//                   onClick={() => toggleExpand(review.id)}
//                   className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 py-2 text-xs font-medium text-muted-foreground transition hover:bg-white/10 hover:text-white"
//                 >
//                   {expanded ? (
//                     <>
//                       Collapse <FiChevronUp />
//                     </>
//                   ) : (
//                     <>
//                       Read Review <FiChevronDown />
//                     </>
//                   )}
//                 </button>
//               </div>

//               {/* Admin Controls */}
//               {isAdmin && (
//                 <div className="border-t border-white/5 px-4 py-3">
//                   <div className="flex items-center justify-between">
//                     <Badge
//                       variant="outline"
//                       className={`text-[10px] uppercase tracking-wide ${
//                         review.status === "APPROVED"
//                           ? "border-emerald-500/20 text-emerald-400"
//                           : "border-yellow-500/20 text-yellow-400"
//                       }`}
//                     >
//                       {review.status}
//                     </Badge>

//                     <div className="flex gap-2">
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 rounded-xl text-emerald-400 hover:bg-emerald-500/10"
//                         onClick={() => moderate(review.id, "APPROVED")}
//                       >
//                         <FiCheck size={14} />
//                       </Button>

//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 rounded-xl text-zinc-400 hover:bg-white/5"
//                         onClick={() => moderate(review.id, "UNPUBLISHED")}
//                       >
//                         <FiEyeOff size={14} />
//                       </Button>

//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-8 w-8 rounded-xl text-red-400 hover:bg-red-500/10"
//                         onClick={() => adminDelete(review.id)}
//                       >
//                         <FiTrash2 size={14} />
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </article>
//           );
//         })}
//       </div>
//     </section>
//   );
// }


"use client";

import { useState } from "react";
import {
  Check,
  EyeOff,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  MessageSquare,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { toast } from "sonner";
import ReviewCard from "./review-card";
import type { Review } from "@/types";

interface MovieReviewListProps {
  initialReviews: Review[];
  mediaId: string;
}

export default function MovieReviewList({
  initialReviews,
}: MovieReviewListProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(initialReviews);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  async function moderate(
    reviewId: string,
    status: "APPROVED" | "UNPUBLISHED"
  ) {
    try {
      await api.patch(`/admin/reviews/${reviewId}/moderate`, { status });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, status } : review
        )
      );

      toast.success(`Review updated`);
    } catch {
      toast.error("Failed to update review");
    }
  }

  async function adminDelete(reviewId: string) {
    if (!confirm("Delete review permanently?")) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success("Deleted successfully");
    } catch {
      toast.error("Delete failed");
    }
  }

  if (!reviews.length) {
    return (
      <Card className="border-dashed border-white/10 bg-secondary/20 rounded-3xl">
        <CardContent className="py-20 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-2xl bg-white/5 mb-4">
            <MessageSquare className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No Reviews Yet</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Be the first to review this movie.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Community Reviews</h2>
          <p className="text-sm text-muted-foreground">
            {reviews.length} reviews
          </p>
        </div>

        {isAdmin && (
          <Badge
            variant="secondary"
            className="gap-2 px-3 py-1 rounded-full"
          >
            <Shield size={14} />
            Admin Mode
          </Badge>
        )}
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {reviews.map((review) => {
          const expanded = expandedId === review.id;

          return (
            <Card
              key={review.id}
              className="rounded-3xl border-white/10 bg-black/40 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all"
            >
              <CardHeader className="pb-0" />

              <CardContent className="pt-2">
                {expanded ? (
                  <ScrollArea className="h-[420px] pr-4">
                    <ReviewCard review={review} />
                  </ScrollArea>
                ) : (
                  <div className="max-h-[260px] overflow-hidden relative">
                    <ReviewCard review={review} />
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="w-full rounded-xl"
                  onClick={() => toggleExpand(review.id)}
                >
                  {expanded ? (
                    <>
                      Collapse <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Read Full Review{" "}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {isAdmin && (
                  <div className="w-full flex items-center justify-between border-t border-white/5 pt-3">
                    <Badge variant="outline">{review.status}</Badge>

                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          moderate(review.id, "APPROVED")
                        }
                      >
                        <Check className="h-4 w-4 text-green-400" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                          moderate(review.id, "UNPUBLISHED")
                        }
                      >
                        <EyeOff className="h-4 w-4 text-yellow-400" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => adminDelete(review.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </section>
  );
}