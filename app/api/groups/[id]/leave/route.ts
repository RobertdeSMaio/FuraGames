import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const group = await prisma.group.findUnique({ where: { id } })
  if (!group) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })

  if (group.ownerId === auth.userId)
    return NextResponse.json({ error: 'O dono não pode sair do grupo. Delete o grupo.' }, { status: 400 })

  await prisma.groupMember.delete({
    where: { userId_groupId: { userId: auth.userId, groupId: id } },
  })

  return NextResponse.json({ message: 'Você saiu do grupo' })
}
