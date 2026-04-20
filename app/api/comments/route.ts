import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { z } from 'zod'

const createSchema = z.object({
  reviewId: z.string().uuid(),
  content: z.string().min(1).max(1000).trim(),
})

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const reviewId = searchParams.get('reviewId')
  if (!reviewId) return NextResponse.json({ error: 'reviewId obrigatório' }, { status: 400 })

  const review = await prisma.gameReview.findUnique({ where: { id: reviewId } })
  if (!review) return NextResponse.json({ error: 'Review não encontrada' }, { status: 404 })

  if (review.userId !== auth.userId && review.groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: review.groupId, userId: auth.userId },
    })
    if (!membership) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  } else if (review.userId !== auth.userId) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const comments = await prisma.comment.findMany({
    where: { reviewId },
    include: { user: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json({ comments })
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
  }

  const { reviewId, content } = parsed.data

  const review = await prisma.gameReview.findUnique({ where: { id: reviewId } })
  if (!review) return NextResponse.json({ error: 'Review não encontrada' }, { status: 404 })

  const isOwner = review.userId === auth.userId
  let canComment = isOwner

  if (!canComment && review.groupId) {
    const membership = await prisma.groupMember.findFirst({
      where: { groupId: review.groupId, userId: auth.userId },
    })
    canComment = !!membership
  }

  if (!canComment) return NextResponse.json({ error: 'Sem permissão para comentar' }, { status: 403 })

  const comment = await prisma.comment.create({
    data: { reviewId, userId: auth.userId, content },
    include: { user: { select: { id: true, name: true, avatar: true } } },
  })

  return NextResponse.json({ comment }, { status: 201 })
}
