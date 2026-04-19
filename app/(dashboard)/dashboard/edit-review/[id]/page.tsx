"use client";

import { useAuth } from "@/components/auth-context";
import { api } from "@/lib/api";
import { GameReview } from "@/lib/types";
import { ArrowLeft, Plus, Star, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditReviewPage() {
  const { user } = useAuth(); // needed for auth guard
  const router = useRouter();
  const params = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    platform: "",
    genre: "",
    rating: 8,
    hoursPlayed: 0,
    status: "completed" as GameReview["status"],
    review: "",
    coverImage: "",
    pros: [""],
    cons: [""],
  });

  useEffect(() => {
    if (!params.id) return;
    api.reviews.get(params.id as string)
      .then(({ review }) => {
        setFormData({
          title: review.title,
          platform: review.platform,
          genre: review.genre,
          rating: review.rating,
          hoursPlayed: review.hoursPlayed,
          status: review.status,
          review: review.review,
          coverImage: review.coverImage || "",
          pros: review.pros.length > 0 ? review.pros : [""],
          cons: review.cons.length > 0 ? review.cons : [""],
        });
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      await api.reviews.update(params.id as string, {
        ...formData,
        pros: formData.pros.filter((p) => p.trim()),
        cons: formData.cons.filter((c) => c.trim()),
      });
      router.push("/dashboard");
    } catch (err) {
      alert("Erro ao salvar alterações. Tente novamente.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addPro = () =>
    setFormData({ ...formData, pros: [...formData.pros, ""] });
  const addCon = () =>
    setFormData({ ...formData, cons: [...formData.cons, ""] });

  const updatePro = (index: number, value: string) => {
    const newPros = [...formData.pros];
    newPros[index] = value;
    setFormData({ ...formData, pros: newPros });
  };

  const updateCon = (index: number, value: string) => {
    const newCons = [...formData.cons];
    newCons[index] = value;
    setFormData({ ...formData, cons: newCons });
  };

  const removePro = (index: number) => {
    if (formData.pros.length > 1) {
      setFormData({
        ...formData,
        pros: formData.pros.filter((_, i) => i !== index),
      });
    }
  };

  const removeCon = (index: number) => {
    if (formData.cons.length > 1) {
      setFormData({
        ...formData,
        cons: formData.cons.filter((_, i) => i !== index),
      });
    }
  };

  if (notFound) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-zinc-400">
            Análise não encontrada ou você não tem permissão para editá-la.
          </p>
          <Link
            href="/dashboard"
            className="text-yellow-400 hover:underline mt-2 inline-block"
          >
            Voltar ao dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Link>

      <h1 className="text-3xl font-bold text-zinc-100 mb-2">Editar Análise</h1>
      <p className="text-zinc-400 mb-8">Atualize os detalhes da sua análise</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-zinc-100">
            Informações do Jogo
          </h2>

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
              placeholder="Ex: The Legend of Zelda: Tears of the Kingdom"
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
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
                placeholder="Ex: PC, PS5, Switch"
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                placeholder="Ex: RPG, Ação, Aventura"
                required
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              URL da Imagem de Capa (opcional)
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) =>
                setFormData({ ...formData, coverImage: e.target.value })
              }
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-zinc-100">Sua Avaliação</h2>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">
                Nota (1-10)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.rating}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rating: parseInt(e.target.value),
                    })
                  }
                  className="flex-1 accent-yellow-500"
                />
                <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-800">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold text-zinc-100">
                    {formData.rating}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-100">
                Horas Jogadas
              </label>
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
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                    status: e.target.value as typeof formData.status,
                  })
                }
                className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
              Sua Análise *
            </label>
            <textarea
              value={formData.review}
              onChange={(e) =>
                setFormData({ ...formData, review: e.target.value })
              }
              placeholder="Escreva sua análise do jogo..."
              required
              rows={4}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Prós</h2>
              <button
                type="button"
                onClick={addPro}
                className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {formData.pros.map((pro, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pro}
                    onChange={(e) => updatePro(index, e.target.value)}
                    placeholder="Ex: Gameplay inovador"
                    className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {formData.pros.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePro(index)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Contras</h2>
              <button
                type="button"
                onClick={addCon}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {formData.cons.map((con, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={con}
                    onChange={(e) => updateCon(index, e.target.value)}
                    placeholder="Ex: Performance ruim"
                    className="flex-1 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {formData.cons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCon(index)}
                      className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 rounded-lg bg-zinc-800 text-zinc-100 font-medium hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-lg bg-yellow-500 text-zinc-950 font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
