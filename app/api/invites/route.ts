import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: auth.userId } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const invites = await prisma.invite.findMany({
    where: { invitedEmail: user.email, status: 'pending' },
    include: {
      group: { select: { id: true, name: true, description: true } },
      invitedByUser: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ invites })
}
