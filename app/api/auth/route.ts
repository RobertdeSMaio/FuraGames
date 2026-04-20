import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'
import { signToken, getAuthUser, checkRateLimit } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  action: z.literal('login'),
  email: z.string().email().max(254).toLowerCase().trim(),
  password: z.string().min(1).max(100),
})

const registerSchema = z.object({
  action: z.literal('register'),
  name: z.string().min(2).max(50).trim(),
  email: z.string().email().max(254).toLowerCase().trim(),
  password: z.string().min(6).max(100),
})

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { name, avatar } = await req.json()
  const user = await prisma.user.update({
    where: { id: auth.userId },
    data: { ...(name && { name }), ...(avatar !== undefined && { avatar }) },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  })
  return NextResponse.json({ user })
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown'
  if (!checkRateLimit(`auth:${ip}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um minuto.' }, { status: 429 })
  }

  const body = await req.json()

  if (body.action === 'register') {
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { name, email, password } = parsed.data

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
      select: { id: true, name: true, email: true, avatar: true, createdAt: true },
    })
    const token = signToken({ userId: user.id, email: user.email })
    return NextResponse.json({ user, token }, { status: 201 })
  }

  if (body.action === 'login') {
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }
    const { email, password } = parsed.data

    const user = await prisma.user.findUnique({ where: { email } })
    const dummyHash = '$2a$12$dummy.hash.to.prevent.timing.attacks.padding'
    const match = user
      ? await bcrypt.compare(password, user.password)
      : await bcrypt.compare(password, dummyHash)

    if (!user || !match) {
      return NextResponse.json({ error: 'Email ou senha incorretos' }, { status: 401 })
    }

    const { password: _, ...userWithout } = user
    const token = signToken({ userId: user.id, email: user.email })
    return NextResponse.json({ user: userWithout, token })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}
