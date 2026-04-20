import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const limit = Math.min(20, parseInt(searchParams.get('limit') || '20'))
  const skip = (page - 1) * limit

  const memberships = await prisma.groupMember.findMany({
    where: { userId: auth.userId },
    select: { groupId: true },
  })
  const groupIds = memberships.map((m) => m.groupId)

  const [reviews, total] = await Promise.all([
    prisma.gameReview.findMany({
      where: {
        OR: [
          { userId: auth.userId },
          { groupId: { in: groupIds } },
        ],
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        group: { select: { id: true, name: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.gameReview.count({
      where: {
        OR: [
          { userId: auth.userId },
          { groupId: { in: groupIds } },
        ],
      },
    }),
  ])

  return NextResponse.json({
    reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  })
}
