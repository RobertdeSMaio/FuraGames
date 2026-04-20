import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const review = await prisma.gameReview.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      group: { select: { id: true, name: true } },
    },
  })

  if (!review) return NextResponse.json({ error: 'Review não encontrada' }, { status: 404 })

  const isOwner = review.userId === auth.userId
  let canView = isOwner

  if (!canView && review.groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: review.groupId, userId: auth.userId },
    })
    canView = !!membership
  }

  if (!canView) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  return NextResponse.json({ review })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.gameReview.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Review não encontrada' }, { status: 404 })

  const body = await req.json()
  const { title, platform, genre, rating, hoursPlayed, status, review, pros, cons, coverImage } = body

  if (rating != null && (rating < 1 || rating > 10))
    return NextResponse.json({ error: 'Rating deve ser entre 1 e 10' }, { status: 400 })

  const updated = await prisma.gameReview.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(platform && { platform }),
      ...(genre && { genre }),
      ...(rating != null && { rating: Number(rating) }),
      ...(hoursPlayed != null && { hoursPlayed: Number(hoursPlayed) }),
      ...(status && { status }),
      ...(review && { review }),
      ...(pros && { pros }),
      ...(cons && { cons }),
      ...(coverImage !== undefined && { coverImage }),
    },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      group: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json({ review: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params
  const existing = await prisma.gameReview.findFirst({ where: { id, userId: auth.userId } })
  if (!existing) return NextResponse.json({ error: 'Review não encontrada' }, { status: 404 })

  await prisma.gameReview.delete({ where: { id } })
  return NextResponse.json({ message: 'Review deletada com sucesso' })
}
