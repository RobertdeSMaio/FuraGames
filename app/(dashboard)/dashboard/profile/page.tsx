"use client";

import { useAuth } from "@/components/auth-context";
import { api } from "@/lib/api";
import { Camera, Lock, Save, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stats, setStats] = useState({ reviews: 0, groups: 0 });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setAvatar((user as unknown as { avatar?: string }).avatar || "");

    fetch("/api/user/profile", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("furagames_token")}`,
      },
    })
      .then((r) => r.json())
      .then(({ user }) => {
        if (user?._count)
          setStats({
            reviews: user._count.reviews,
            groups: user._count.groupMembers,
          });
      })
      .catch(console.error);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.auth.update({ name, avatar: avatar || undefined });
      setProfileMsg({
        type: "success",
        text: "Perfil atualizado com sucesso!",
      });
      window.location.reload();
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao atualizar perfil",
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "As senhas não coincidem" });
      return;
    }
    setIsSavingPassword(true);
    try {
      const token = localStorage.getItem("furagames_token");
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPasswordMsg({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Erro ao alterar senha",
      });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-zinc-100 mb-2">Meu Perfil</h1>
      <p className="text-zinc-400 mb-8">Gerencie suas informações pessoais</p>

      {}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
          <p className="text-2xl font-bold text-yellow-400">{stats.reviews}</p>
          <p className="text-sm text-zinc-400 mt-1">Análises</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
          <p className="text-2xl font-bold text-violet-400">{stats.groups}</p>
          <p className="text-sm text-zinc-400 mt-1">Grupos</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 text-center">
          <p className="text-sm font-mono text-zinc-300 mt-1 truncate">
            {user?.email}
          </p>
          <p className="text-sm text-zinc-400 mt-1">Email</p>
        </div>
      </div>

      {}
      <form
        onSubmit={handleSaveProfile}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5 mb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <User className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-zinc-100">
            Informações Pessoais
          </h2>
        </div>

        {}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-700 overflow-hidden flex items-center justify-center flex-shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-zinc-400">
                {name?.[0]?.toUpperCase() || "?"}
              </span>
            )}
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-zinc-100 block mb-1">
              <Camera className="w-4 h-4 inline mr-1" />
              URL do Avatar
            </label>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-100">
            Nome / Nickname *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={50}
            placeholder="Seu nome ou nickname"
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {profileMsg && (
          <p
            className={`text-sm px-3 py-2 rounded-lg ${profileMsg.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
          >
            {profileMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isSavingProfile}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-yellow-500 text-zinc-950 font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSavingProfile ? "Salvando..." : "Salvar Perfil"}
        </button>
      </form>

      {}
      <form
        onSubmit={handleSavePassword}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 space-y-5"
      >
        <div className="flex items-center gap-3 mb-2">
          <Lock className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-zinc-100">Alterar Senha</h2>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-100">
            Senha Atual *
          </label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-100">
            Nova Senha *
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-100">
            Confirmar Nova Senha *
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        {passwordMsg && (
          <p
            className={`text-sm px-3 py-2 rounded-lg ${passwordMsg.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}
          >
            {passwordMsg.text}
          </p>
        )}

        <button
          type="submit"
          disabled={isSavingPassword}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-zinc-700 text-zinc-100 font-semibold hover:bg-zinc-600 transition-colors disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          {isSavingPassword ? "Alterando..." : "Alterar Senha"}
        </button>
      </form>
    </div>
  );
}
