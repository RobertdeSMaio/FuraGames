"use client";

import { useAuth } from "@/components/auth-context";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; avatar?: string };
}

export default function CommentsSection({ reviewId }: { reviewId: string }) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("furagames_token") : null;

  useEffect(() => {
    if (!token) return;
    fetch(`/api/comments?reviewId=${reviewId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ comments }) => setComments(comments || []))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [reviewId, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewId, content: newComment.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setComments([...comments, data.comment]);
      setNewComment("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!token) return;
    try {
      await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-semibold text-zinc-100">
          Comentários ({comments.length})
        </h2>
      </div>

      {}
      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-zinc-300">
          {user?.name?.[0]?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escreva um comentário..."
            maxLength={1000}
            className="flex-1 px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
          />
          <button
            type="submit"
            disabled={isSubmitting || !newComment.trim()}
            className="px-4 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-14 bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-6">
          Nenhum comentário ainda. Seja o primeiro!
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3 group">
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0 text-sm font-bold text-zinc-300 overflow-hidden">
                {comment.user.avatar ? (
                  <img src={comment.user.avatar} alt={comment.user.name} className="w-full h-full object-cover" />
                ) : (
                  comment.user.name?.[0]?.toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-zinc-100">{comment.user.name}</span>
                  <span className="text-xs text-zinc-500">
                    {new Date(comment.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">{comment.content}</p>
              </div>
              {user?.id === comment.user.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
