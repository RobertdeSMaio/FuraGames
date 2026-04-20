import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const updateSchema = z.object({
  name: z.string().min(2).max(50).trim().optional(),
  avatar: z.string().url().max(500).optional().nullable(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).max(100).optional(),
})

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true, name: true, email: true, avatar: true, createdAt: true,
      _count: { select: { reviews: true, groupMembers: true } },
    },
  })

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  return NextResponse.json({ user })
}

export async function PUT(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { name, avatar, currentPassword, newPassword } = parsed.data

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: 'Senha atual é obrigatória para alterar a senha' }, { status: 400 })
    }
    const user = await prisma.user.findUnique({ where: { id: auth.userId } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
  }

  const updateData: Record<string, unknown> = {}
  if (name) updateData.name = name
  if (avatar !== undefined) updateData.avatar = avatar
  if (newPassword) updateData.password = await bcrypt.hash(newPassword, 12)

  const updated = await prisma.user.update({
    where: { id: auth.userId },
    data: updateData,
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  })

  return NextResponse.json({ user: updated })
}
