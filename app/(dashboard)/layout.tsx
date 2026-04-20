"use client";

import { useAuth } from "@/components/auth-context";
import { Gamepad2, LayoutDashboard, LogOut, Plus, Rss, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => { logout(); router.push("/"); };

  const navItems = [
    { href: "/dashboard/feed", label: "Feed", icon: Rss },
    { href: "/dashboard", label: "Minhas Análises", icon: LayoutDashboard },
    { href: "/dashboard/groups", label: "Grupos", icon: Users },
  ];

  const avatarUrl = (user as any).avatar;

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col fixed h-full">
        <div className="p-4 border-b border-zinc-800">
          <Link href="/dashboard/feed" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="font-bold text-xl text-zinc-100">FuraGames</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-yellow-500 text-zinc-950" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/dashboard/new-review"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors mt-2"
          >
            <Plus className="w-5 h-5" />
            Nova Análise
          </Link>
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-2">
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full ${
              pathname === "/dashboard/profile" ? "bg-zinc-700" : "hover:bg-zinc-800"
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-semibold text-zinc-100">{user.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-100 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
            <User className="w-4 h-4 text-zinc-500" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64">{children}</main>
    </div>
  );
}
