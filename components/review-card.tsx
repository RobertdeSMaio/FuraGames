"use client"

import { GameReview } from '@/lib/types'
import { Star, Clock, Gamepad2, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'

interface ReviewCardProps {
  review: GameReview
  showAuthor?: boolean
  onDelete?: (id: string) => void
  canEdit?: boolean
}

const statusLabels: Record<GameReview['status'], string> = {
  'playing': 'Jogando',
  'completed': 'Completado',
  'dropped': 'Abandonado',
  'on-hold': 'Em espera',
  'want-to-play': 'Quero jogar',
}

const statusColors: Record<GameReview['status'], string> = {
  'playing': 'bg-blue-500/20 text-blue-400',
  'completed': 'bg-emerald-500/20 text-emerald-400',
  'dropped': 'bg-red-500/20 text-red-400',
  'on-hold': 'bg-amber-500/20 text-amber-400',
  'want-to-play': 'bg-violet-500/20 text-violet-400',
}

export function ReviewCard({ review, showAuthor = false, onDelete, canEdit = false }: ReviewCardProps) {
  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-emerald-500/30 transition-colors group">
      <div className="aspect-[4/3] relative bg-zinc-800">
        {review.coverImage ? (
          <img
            src={review.coverImage}
            alt={review.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gamepad2 className="w-12 h-12 text-zinc-600" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[review.status]}`}>
            {statusLabels[review.status]}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg bg-zinc-950/80 backdrop-blur-sm">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-zinc-100">{review.rating}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-lg text-zinc-100 line-clamp-1 mb-2">
          {review.title}
        </h3>

        <div className="flex items-center gap-3 text-sm text-zinc-400 mb-3">
          <span>{review.platform}</span>
          <span className="w-1 h-1 rounded-full bg-zinc-600" />
          <span>{review.genre}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
          <Clock className="w-4 h-4" />
          <span>{review.hoursPlayed}h jogadas</span>
        </div>

        <p className="text-sm text-zinc-400 line-clamp-2 mb-4">
          {review.review}
        </p>

        {showAuthor && (
          <p className="text-xs text-zinc-500 mb-4">
            Por <span className="text-zinc-100">{(review as any).user?.name || review.userName || "Usuário"}</span>
          </p>
        )}

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/review/${review.id}`}
            className="flex-1 py-2 text-center rounded-lg bg-zinc-800 text-zinc-100 text-sm font-medium hover:bg-zinc-700 transition-colors"
          >
            Ver detalhes
          </Link>
          
          {canEdit && (
            <>
              <Link
                href={`/dashboard/edit-review/${review.id}`}
                className="p-2 rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(review.id)}
                  className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
