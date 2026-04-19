import { getAuthUser, signToken } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });
  if (!user)
    return NextResponse.json(
      { error: "Usuário não encontrado" },
      { status: 404 },
    );
  return NextResponse.json({ user });
}

export async function PUT(req: NextRequest) {
  const auth = getAuthUser(req);
  if (!auth)
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { name, avatar } = await req.json();
  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { ...(name && { name }), ...(avatar !== undefined && { avatar }) },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const { action, name, email, password } = await req.json();

  if (action === "register") {
    if (!name || !email || !password)
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
      );
    if (password.length < 6)
      return NextResponse.json(
        { error: "Senha deve ter no mínimo 6 caracteres" },
        { status: 400 },
      );

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 409 },
      );

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        createdAt: true,
      },
    });
    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({ user, token }, { status: 201 });
  }

  if (action === "login") {
    if (!email || !password)
      return NextResponse.json(
        { error: "Email e senha são obrigatórios" },
        { status: 400 },
      );

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 },
      );

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return NextResponse.json(
        { error: "Email ou senha incorretos" },
        { status: 401 },
      );

    const { password: _, ...userWithout } = user;
    const token = signToken({ userId: user.id, email: user.email });
    return NextResponse.json({ user: userWithout, token });
  }

  return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
