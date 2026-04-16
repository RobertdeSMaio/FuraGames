"use client";

import { useAuth } from "@/components/auth-context";
import { ReviewCard } from "@/components/review-card";
import { store } from "@/lib/store";
import { GameReview } from "@/lib/types";
import { Filter, Gamepad2, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<GameReview[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      const userReviews = store.getReviews(user.id);
      setReviews(userReviews);
    }
  }, [user]);

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta análise?")) {
      store.deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    }
  };

  const filteredReviews = reviews.filter((review) => {
    const matchesSearch = review.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || review.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    completed: reviews.filter((r) => r.status === "completed").length,
    playing: reviews.filter((r) => r.status === "playing").length,
    avgRating:
      reviews.length > 0
        ? (
            reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
          ).toFixed(1)
        : "0",
    totalHours: reviews.reduce((acc, r) => acc + r.hoursPlayed, 0),
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          Minhas Análises
        </h1>
        <p className="text-zinc-400">
          Gerencie suas análises e reviews de jogos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Total de Jogos</p>
          <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Completados</p>
          <p className="text-2xl font-bold text-emerald-400">
            {stats.completed}
          </p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Nota Média</p>
          <p className="text-2xl font-bold text-amber-400">{stats.avgRating}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
          <p className="text-sm text-zinc-400 mb-1">Horas Jogadas</p>
          <p className="text-2xl font-bold text-violet-400">
            {stats.totalHours}h
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar jogos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none cursor-pointer"
          >
            <option value="all">Todos os status</option>
            <option value="playing">Jogando</option>
            <option value="completed">Completado</option>
            <option value="dropped">Abandonado</option>
            <option value="on-hold">Em espera</option>
            <option value="want-to-play">Quero jogar</option>
          </select>
        </div>

        <Link
          href="/dashboard/new-review"
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nova Análise
        </Link>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={handleDelete}
              canEdit={true}
            />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center mb-4">
            <Gamepad2 className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">
            {searchTerm || statusFilter !== "all"
              ? "Nenhum jogo encontrado"
              : "Nenhuma análise ainda"}
          </h3>
          <p className="text-zinc-400 mb-6">
            {searchTerm || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Comece adicionando sua primeira análise de jogo"}
          </p>
          {!searchTerm && statusFilter === "all" && (
            <Link
              href="/dashboard/new-review"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar primeira análise
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
