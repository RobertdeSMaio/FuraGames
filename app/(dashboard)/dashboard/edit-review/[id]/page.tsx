"use client";

import { useAuth } from "@/components/auth-context";
import { api } from "@/lib/api";
import { GameReview } from "@/lib/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Gamepad2,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const statusLabels: Record<GameReview["status"], string> = {
  playing: "Jogando",
  completed: "Completado",
  dropped: "Abandonado",
  "on-hold": "Em espera",
  "want-to-play": "Quero jogar",
};

const statusColors: Record<GameReview["status"], string> = {
  playing: "bg-blue-500/20 text-blue-400",
  completed: "bg-emerald-500/20 text-emerald-400",
  dropped: "bg-red-500/20 text-red-400",
  "on-hold": "bg-amber-500/20 text-amber-400",
  "want-to-play": "bg-violet-500/20 text-violet-400",
};

export default function ReviewDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [review, setReview] = useState<GameReview | null>(null);

  useEffect(() => {
    if (!params.id) return;
    api.reviews
      .get(params.id as string)
      .then(({ review }) => setReview(review))
      .catch(() => setReview(null));
  }, [params.id]);

  if (!review) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-zinc-400">Análise não encontrada</p>
          <Link
            href="/dashboard"
            className="text-blue-400 hover:underline mt-2 inline-block"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === review.userId;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        {isOwner && (
          <Link
            href={`/dashboard/edit-review/${review.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          <div className="aspect-3/4 rounded-2xl overflow-hidden bg-zinc-800">
            {review.coverImage ? (
              <img
                src={review.coverImage}
                alt={review.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Gamepad2 className="w-16 h-16 text-zinc-600" />
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${statusColors[review.status]}`}
            >
              {statusLabels[review.status]}
            </span>
            <h1 className="text-3xl font-bold text-zinc-100 mb-2">
              {review.title}
            </h1>
            <div className="flex items-center gap-4 text-zinc-400">
              <span>{review.platform}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              <span>{review.genre}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-2xl font-bold text-zinc-100">
                {review.rating}/10
              </p>
              <p className="text-sm text-zinc-500">Nota</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-5 h-5 text-violet-400" />
              </div>
              <p className="text-2xl font-bold text-zinc-100">
                {review.hoursPlayed}h
              </p>
              <p className="text-sm text-zinc-500">Jogadas</p>
            </div>
            <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-5 h-5 text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-zinc-100">
                {new Date(review.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
              <p className="text-sm text-zinc-500">Criado</p>
            </div>
          </div>

          {/* Review Text */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-100 mb-3">
              Análise
            </h2>
            <p className="text-zinc-400 whitespace-pre-wrap">{review.review}</p>
            <p className="text-sm text-zinc-500 mt-4">
              Por{" "}
              <span className="text-zinc-100">
                {(review as any).user?.name || review.userName || "Usuário"}
              </span>
            </p>
          </div>

          {/* Pros and Cons */}
          <div className="grid sm:grid-cols-2 gap-4">
            {review.pros.length > 0 && (
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsUp className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-zinc-100">Prós</h2>
                </div>
                <ul className="space-y-2">
                  {review.pros.map((pro, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-zinc-400"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {review.cons.length > 0 && (
              <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <ThumbsDown className="w-5 h-5 text-red-400" />
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Contras
                  </h2>
                </div>
                <ul className="space-y-2">
                  {review.cons.map((con, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-zinc-400"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
