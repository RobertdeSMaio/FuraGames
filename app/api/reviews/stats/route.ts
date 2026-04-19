import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const auth = getAuthUser(req)
  if (!auth) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const reviews = await prisma.gameReview.findMany({ where: { userId: auth.userId } })

  const total = reviews.length
  const avgRating = total > 0
    ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / total
    : 0
  const totalHours = reviews.reduce((s: number, r: { hoursPlayed: number }) => s + r.hoursPlayed, 0)

  const byStatus = reviews.reduce((acc: Record<string, number>, r: { status: string }) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  const byPlatform = reviews.reduce((acc: Record<string, number>, r: { platform: string }) => {
    acc[r.platform] = (acc[r.platform] || 0) + 1
    return acc
  }, {})

  const byGenre = reviews.reduce((acc: Record<string, number>, r: { genre: string }) => {
    acc[r.genre] = (acc[r.genre] || 0) + 1
    return acc
  }, {})

  return NextResponse.json({ total, avgRating, totalHours, byStatus, byPlatform, byGenre })
}
