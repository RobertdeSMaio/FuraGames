import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const membership = await prisma.groupMember.findFirst({
    where: { groupId: id, userId: auth.userId },
  })
  if (!membership)
    return NextResponse.json({ error: 'Você não é membro deste grupo' }, { status: 403 })

  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })

  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })

  const targetUser = await prisma.user.findUnique({ where: { email } })
  if (targetUser) {
    const alreadyMember = await prisma.groupMember.findFirst({
      where: { groupId: id, userId: targetUser.id },
    })
    if (alreadyMember)
      return NextResponse.json({ error: 'Este usuário já é membro do grupo' }, { status: 409 })
  }

  const existingInvite = await prisma.invite.findFirst({
    where: { groupId: id, invitedEmail: email, status: 'pending' },
  })
  if (existingInvite)
    return NextResponse.json({ error: 'Convite já enviado para este email' }, { status: 409 })

  const invite = await prisma.invite.create({
    data: { groupId: id, invitedBy: auth.userId, invitedEmail: email, status: 'pending' },
    include: {
      group: { select: { id: true, name: true } },
      invitedByUser: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ invite }, { status: 201 })
}
