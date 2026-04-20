"use client";

import { useAuth } from "@/components/auth-context";
import { ReviewCard } from "@/components/review-card";
import { GameReview } from "@/lib/types";
import { Gamepad2, Rss } from "lucide-react";
import { useEffect, useState } from "react";

export default function FeedPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetch("/api/feed", {
      headers: { Authorization: `Bearer ${localStorage.getItem("furagames_token")}` },
    })
      .then((r) => r.json())
      .then(({ reviews }) => setReviews(reviews || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [user]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Rss className="w-7 h-7 text-yellow-400" />
          <h1 className="text-3xl font-bold text-zinc-100">Feed</h1>
        </div>
        <p className="text-zinc-400">
          Todas as análises suas e dos seus grupos
        </p>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 h-64 animate-pulse" />
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showAuthor={true}
              canEdit={review.userId === user?.id}
            />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center mb-4">
            <Gamepad2 className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">
            Nenhuma análise ainda
          </h3>
          <p className="text-zinc-400">
            Entre em grupos ou crie sua primeira análise para ver o feed
          </p>
        </div>
      )}
    </div>
  );
}
