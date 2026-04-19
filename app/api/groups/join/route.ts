import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { inviteCode } = await req.json()
  if (!inviteCode)
    return NextResponse.json({ error: 'Código de convite é obrigatório' }, { status: 400 })

  const group = await prisma.group.findUnique({ where: { inviteCode } })
  if (!group)
    return NextResponse.json({ error: 'Código de convite inválido' }, { status: 404 })

  const alreadyMember = await prisma.groupMember.findFirst({
    where: { groupId: group.id, userId: auth.userId },
  })
  if (alreadyMember)
    return NextResponse.json({ error: 'Você já é membro deste grupo' }, { status: 409 })

  await prisma.groupMember.create({
    data: { groupId: group.id, userId: auth.userId, role: 'member' },
  })

  const updated = await prisma.group.findUnique({
    where: { id: group.id },
    include: {
      owner: { select: { id: true, name: true, avatar: true } },
      members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
      _count: { select: { reviews: true } },
    },
  })

  return NextResponse.json({ group: updated })
}
