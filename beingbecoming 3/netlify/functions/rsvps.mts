import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { timingSafeEqual } from 'node:crypto'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

type Rsvp = {
  name: string
  email: string
  guests: '1' | '2'
  submittedAt: string
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export default async (req: Request) => {
  if (req.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  if (!ADMIN_PASSWORD) {
    return new Response('Admin access not configured', { status: 500 })
  }

  const provided = (req.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '')
  if (!provided || !safeEqual(provided, ADMIN_PASSWORD)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const store = getStore('rsvps')
  const { blobs } = await store.list()
  const entries = await Promise.all(
    blobs.map(({ key }) => store.get(key, { type: 'json' }) as Promise<Rsvp | null>),
  )

  const rsvps = entries
    .filter((entry): entry is Rsvp => entry !== null)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))

  return new Response(JSON.stringify({ rsvps }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config: Config = {
  path: '/.netlify/functions/rsvps',
}
