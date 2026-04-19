"use client";

import { useAuth } from "@/components/auth-context";
import { ReviewCard } from "@/components/review-card";
import { api } from "@/lib/api";
import { GameReview, Group } from "@/lib/types";
import { ArrowLeft, Check, Copy, Crown, Plus, User, Users } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    api.groups.get(params.id as string)
      .then(({ group }) => {
        setGroup(group);
        setReviews(group.reviews || []);
      })
      .catch(() => setGroup(null));
  }, [params.id]);

  const copyInviteCode = () => {
    if (!group) return;
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDeleteReview = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta análise?")) {
      try {
        await api.reviews.delete(id);
        setReviews(reviews.filter((r) => r.id !== id));
      } catch (e) { console.error(e); }
    }
  };

  if (!group) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-zinc-400">Grupo não encontrado</p>
          <Link
            href="/dashboard/groups"
            className="text-yellow-400 hover:underline mt-2 inline-block"
          >
            Voltar aos grupos
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === group.ownerId;
  const isMember = group.members.some((m) => m.userId === user?.id);

  if (!isMember) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-zinc-400">Você não é membro deste grupo</p>
          <Link
            href="/dashboard/groups"
            className="text-yellow-400 hover:underline mt-2 inline-block"
          >
            Voltar aos grupos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Link
        href="/dashboard/groups"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos grupos
      </Link>

      {/* Header */}
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 flex items-center justify-center">
              <Users className="w-8 h-8 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-zinc-100">{group.name}</h1>
              <p className="text-zinc-400 mt-1">{group.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowMembersModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>
                {group.members.length} membro{group.members.length !== 1 && "s"}
              </span>
            </button>
            <button
              onClick={copyInviteCode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 transition-colors"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4 text-yellow-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {group.inviteCode}
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddReviewModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Análise
          </button>
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Análises do Grupo ({reviews.length})
        </h2>
      </div>

      {reviews.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showAuthor={true}
              canEdit={review.userId === user?.id}
              onDelete={
                review.userId === user?.id ? handleDeleteReview : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400 mb-4">Nenhuma análise no grupo ainda</p>
          <button
            onClick={() => setShowAddReviewModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar primeira análise
          </button>
        </div>
      )}

      {/* Add Review Modal */}
      {showAddReviewModal && (
        <AddReviewToGroupModal
          groupId={group.id}
          onClose={() => setShowAddReviewModal(false)}
          onAdded={(review) => {
            setReviews([review, ...reviews]);
            setShowAddReviewModal(false);
          }}
        />
      )}

      {/* Members Modal */}
      {showMembersModal && (
        <MembersModal
          group={group}
          isOwner={isOwner}
          onClose={() => setShowMembersModal(false)}
        />
      )}
    </div>
  );
}

function AddReviewToGroupModal({
  groupId,
  onClose,
  onAdded,
}: {
  groupId: string;
  onClose: () => void;
  onAdded: (review: GameReview) => void;
}) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    platform: "",
    genre: "",
    rating: 8,
    hoursPlayed: 0,
    status: "completed" as GameReview["status"],
    review: "",
    coverImage: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);

    const review = store.addReview({
      ...formData,
      userId: user.id,
      userName: user.name,
      groupId,
      pros: [],
      cons: [],
    });

    onAdded(review);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-lg my-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Adicionar Análise ao Grupo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              Nome do Jogo *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">
                Plataforma *
              </label>
              <input
                type="text"
                value={formData.platform}
                onChange={(e) =>
                  setFormData({ ...formData, platform: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">
                Gênero *
              </label>
              <input
                type="text"
                value={formData.genre}
                onChange={(e) =>
                  setFormData({ ...formData, genre: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">Nota</label>
              <select
                value={formData.rating}
                onChange={(e) =>
                  setFormData({ ...formData, rating: parseInt(e.target.value) })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">Horas</label>
              <input
                type="number"
                min="0"
                value={formData.hoursPlayed}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hoursPlayed: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as GameReview["status"],
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="completed">Completado</option>
                <option value="playing">Jogando</option>
                <option value="dropped">Abandonado</option>
                <option value="on-hold">Em espera</option>
                <option value="want-to-play">Quero jogar</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              Análise *
            </label>
            <textarea
              value={formData.review}
              onChange={(e) =>
                setFormData({ ...formData, review: e.target.value })
              }
              required
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              URL da Imagem (opcional)
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-zinc-800 text-zinc-100 font-medium hover:bg-zinc-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? "Adicionando..." : "Adicionar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MembersModal({
  group,
  isOwner,
  onClose,
}: {
  group: Group;
  isOwner: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Membros ({group.members.length})
        </h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {group.members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center">
                {member.role === "owner" ? (
                  <Crown className="w-5 h-5 text-amber-400" />
                ) : (
                  <User className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-zinc-100">
                  {member.userName}
                </p>
                <p className="text-xs text-zinc-500 capitalize">
                  {member.role === "owner" ? "Dono" : "Membro"}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-lg bg-zinc-800 text-zinc-100 font-medium hover:bg-zinc-700 transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
