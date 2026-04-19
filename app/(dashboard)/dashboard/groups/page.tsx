"use client";

import { useAuth } from "@/components/auth-context";
import { api } from "@/lib/api";
import { Group } from "@/lib/types";
import { Check, Copy, LogOut, Plus, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.groups
        .list()
        .then(({ groups }) => setGroups(groups))
        .catch(console.error);
    }
  }, [user]);

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;
    if (confirm("Tem certeza que deseja sair deste grupo?")) {
      try {
        await api.groups.leave(groupId);
        setGroups(groups.filter((g) => g.id !== groupId));
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Erro ao sair do grupo");
      }
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!user) return;
    if (
      confirm(
        "Tem certeza que deseja excluir este grupo? Todas as análises do grupo serão perdidas.",
      )
    ) {
      try {
        await api.groups.delete(groupId);
        setGroups(groups.filter((g) => g.id !== groupId));
      } catch (e: unknown) {
        alert(e instanceof Error ? e.message : "Erro ao deletar grupo");
      }
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Meus Grupos</h1>
          <p className="text-zinc-400">
            Gerencie seus grupos e compartilhe análises
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-5 py-2.5 rounded-lg bg-zinc-800 text-zinc-100 font-medium hover:bg-zinc-700 transition-colors"
          >
            Entrar em Grupo
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Criar Grupo
          </button>
        </div>
      </div>

      {groups.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isOwner = group.ownerId === user?.id;
            return (
              <div
                key={group.id}
                className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 hover:border-yellow-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-violet-400" />
                  </div>
                  {isOwner ? (
                    <span className="px-2 py-1 rounded-full bg-orange-500/10 text-yellow-400 text-xs font-medium">
                      Dono
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium">
                      Membro
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                  {group.name}
                </h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                  {group.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                  <Users className="w-4 h-4" />
                  <span>
                    {group.members.length} membro
                    {group.members.length !== 1 && "s"}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 mb-4">
                  <span className="text-xs text-zinc-500">Código:</span>
                  <code className="flex-1 text-sm font-mono text-zinc-100">
                    {group.inviteCode}
                  </code>
                  <button
                    onClick={() => copyInviteCode(group.inviteCode)}
                    className="p-1.5 rounded-md hover:bg-zinc-700 transition-colors"
                    title="Copiar código"
                  >
                    {copiedCode === group.inviteCode ? (
                      <Check className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-zinc-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/groups/${group.id}`}
                    className="flex-1 py-2.5 text-center rounded-lg bg-yellow-500 text-zinc-950 text-sm font-medium hover:bg-orange-400 transition-colors"
                  >
                    Ver Grupo
                  </Link>
                  {isOwner ? (
                    <button
                      onClick={() => handleDeleteGroup(group.id)}
                      className="p-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Excluir grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="p-2.5 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                      title="Sair do grupo"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-semibold text-zinc-100 mb-2">
            Nenhum grupo ainda
          </h3>
          <p className="text-zinc-400 mb-6">
            Crie um grupo para compartilhar análises com seus amigos
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 rounded-lg bg-zinc-800 text-zinc-100 font-medium hover:bg-zinc-700 transition-colors"
            >
              Entrar em Grupo
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-orange-400 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Criar Grupo
            </button>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <CreateGroupModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(group) => {
            setGroups([...groups, group]);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Join Group Modal */}
      {showJoinModal && (
        <JoinGroupModal
          onClose={() => setShowJoinModal(false)}
          onJoined={(group) => {
            if (!groups.find((g) => g.id === group.id)) {
              setGroups([...groups, group]);
            }
            setShowJoinModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateGroupModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (group: Group) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { group } = await api.groups.create(name, description);
      onCreated(group);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Erro ao criar grupo");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Criar Novo Grupo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              Nome do Grupo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: RPG Enthusiasts"
              required
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito do grupo..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
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
              {isSubmitting ? "Criando..." : "Criar Grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function JoinGroupModal({
  onClose,
  onJoined,
}: {
  onClose: () => void;
  onJoined: (group: Group) => void;
}) {
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const { group } = await api.groups.join(inviteCode);
      onJoined(group);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Código de convite inválido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Entrar em um Grupo
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-100">
              Código de Convite *
            </label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Ex: ABC123"
              required
              maxLength={250}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 font-mono uppercase tracking-wider"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
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
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
