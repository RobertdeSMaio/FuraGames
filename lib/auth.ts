import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production')
}
const SECRET = JWT_SECRET || 'furagames_dev_secret_not_for_production'

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, SECRET, {
    expiresIn: '7d',
    issuer: 'furagames',
    audience: 'furagames-client',
  })
}

export function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, SECRET, {
      issuer: 'furagames',
      audience: 'furagames-client',
    }) as { userId: string; email: string }
    return decoded
  } catch {
    return null
  }
}

export function getAuthUser(req: NextRequest): { userId: string; email: string } | null {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.substring(7)
  if (!token || token.length > 1000) return null
  return verifyToken(token)
}

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) return false
  entry.count++
  return true
}
