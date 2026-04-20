import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const comment = await prisma.comment.findUnique({ where: { id } })
  if (!comment) return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 })
  if (comment.userId !== auth.userId)
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  await prisma.comment.delete({ where: { id } })
  return NextResponse.json({ message: 'Comentário deletado' })
}
