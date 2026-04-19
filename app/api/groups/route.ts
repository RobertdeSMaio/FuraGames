import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const groups = await prisma.group.findMany({
    where: { members: { some: { userId: auth.userId } } },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ groups })
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { name, description } = await req.json()
  if (!name || !description)
    return NextResponse.json({ error: 'Nome e descrição são obrigatórios' }, { status: 400 })

  const group = await prisma.group.create({
    data: {
      name, description,
      ownerId: auth.userId,
      members: { create: { userId: auth.userId, role: 'owner' } },
    },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { reviews: true } },
    },
  })

  return NextResponse.json({ group }, { status: 201 })
}
