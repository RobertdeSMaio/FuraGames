import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const group = await prisma.group.findFirst({
    where: { id, members: { some: { userId: auth.userId } } },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      reviews: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
  return NextResponse.json({ group })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const membership = await prisma.groupMember.findFirst({
    where: { groupId: id, userId: auth.userId },
  })
  if (!membership || !['owner', 'admin'].includes(membership.role))
    return NextResponse.json({ error: 'Sem permissão para editar este grupo' }, { status: 403 })

  const { name, description } = await req.json()
  const group = await prisma.group.update({
    where: { id },
    data: { ...(name && { name }), ...(description && { description }) },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { reviews: true } },
    },
  })

  return NextResponse.json({ group })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })
  if (group.ownerId !== auth.userId)
    return NextResponse.json({ error: 'Apenas o dono pode deletar o grupo' }, { status: 403 })

  await prisma.group.delete({ where: { id } })
  return NextResponse.json({ message: 'Grupo deletado com sucesso' })
}
