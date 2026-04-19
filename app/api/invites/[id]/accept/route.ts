import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const invite = await prisma.invite.findFirst({
    where: { id, invitedEmail: user.email, status: 'pending' },
  })
  if (!invite) return NextResponse.json({ error: 'Convite não encontrado' }, { status: 404 })

  await prisma.$transaction([
    prisma.invite.update({ where: { id: invite.id }, data: { status: 'accepted' } }),
    prisma.groupMember.upsert({
      where: { userId_groupId: { userId: auth.userId, groupId: invite.groupId } },
      create: { userId: auth.userId, groupId: invite.groupId, role: 'member' },
      update: {},
    }),
  ])

  const group = await prisma.group.findUnique({
    where: { id: invite.groupId },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { reviews: true } },
    },
  })

  return NextResponse.json({ message: 'Convite aceito com sucesso', group })
}
