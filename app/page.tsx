"use client";

import { useAuth } from "@/components/auth-context";
import { ArrowRight, BookOpen, Gamepad2, Star, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center">
              <Gamepad2 className="w-6 h-6 text-zinc-950" />
            </div>
            <span className="font-bold text-xl text-zinc-100">FuraGames</span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="px-5 py-2 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-yellow-400 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-lg text-zinc-100 hover:bg-zinc-800 transition-colors font-medium"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-lg bg-yellow-500 text-zinc-950 font-medium hover:bg-yellow-400 transition-colors"
                >
                  Criar conta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 text-yellow-400 text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Suas análises em um só lugar
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-zinc-100 leading-tight text-balance">
            Guarde suas memórias de jogos para sempre
          </h1>
          <p className="mt-6 text-xl text-zinc-400 max-w-2xl mx-auto text-pretty">
            Crie análises detalhadas dos jogos que você jogou, organize em
            grupos e compartilhe com seus amigos.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-yellow-500 text-zinc-950 font-semibold text-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
            >
              Começar agora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-800 text-zinc-100 font-semibold text-lg hover:bg-zinc-700 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-zinc-100 mb-12">
            Tudo que você precisa
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <div className="w-14 h-14 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">
                Análises Detalhadas
              </h3>
              <p className="text-zinc-400">
                Registre prós, contras, nota, horas jogadas e tudo sobre cada
                jogo que você terminou.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <div className="w-14 h-14 rounded-xl bg-violet-500/10 flex items-center justify-center mb-6">
                <Users className="w-7 h-7 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">
                Grupos Colaborativos
              </h3>
              <p className="text-zinc-400">
                Crie grupos com amigos e compartilhe análises. Cada membro pode
                adicionar suas próprias reviews.
              </p>
            </div>

            <div className="bg-zinc-900 rounded-2xl p-8 border border-zinc-800">
              <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6">
                <Star className="w-7 h-7 text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-100 mb-3">
                Sistema de Notas
              </h3>
              <p className="text-zinc-400">
                Avalie jogos de 1 a 10 e veja a média das análises do seu grupo.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center bg-zinc-900 rounded-3xl p-12 border border-zinc-800">
          <h2 className="text-3xl font-bold text-zinc-100 mb-4">
            Pronto para começar?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Crie sua conta gratuitamente e comece a registrar suas experiências
            com jogos.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-yellow-500 text-zinc-950 font-semibold text-lg hover:bg-yellow-400 transition-colors"
          >
            Criar minha conta
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-zinc-950" />
            </div>
            <span className="font-semibold text-zinc-100">FuraGames</span>
          </div>
          <p className="text-sm text-zinc-500">Feito para gamers</p>
        </div>
      </footer>
    </main>
  );
}
