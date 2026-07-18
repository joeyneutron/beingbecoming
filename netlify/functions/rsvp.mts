import type { Config } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import { randomUUID } from 'node:crypto'

const RESEND_API_KEY = process.env.RESEND_API_KEY
const RESEND_FROM = process.env.RESEND_FROM ?? 'Being and Becoming <onboarding@resend.dev>'

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function confirmationEmailHtml(name: string, guests: '1' | '2'): string {
  const first = name.trim().split(/\s+/)[0]
  return `
    <div style="font-family: system-ui, -apple-system, Helvetica, Arial, sans-serif; background:#000; color:#e8e3dc; padding:32px;">
      <h1 style="color:#f2ff00; text-transform:uppercase; margin:0 0 16px;">${first}, you're in.</h1>
      <p style="margin:0 0 20px;">You're confirmed for Being and Becoming — an exhibition by Joel Nnogo and David Nnogo.</p>
      <table style="border-collapse:collapse;">
        <tr><td style="color:#888; padding:4px 16px 4px 0;">Date</td><td>Saturday, August 1st 2026</td></tr>
        <tr><td style="color:#888; padding:4px 16px 4px 0;">Time</td><td>13:00 — 19:00</td></tr>
        <tr><td style="color:#888; padding:4px 16px 4px 0;">Venue</td><td>The Gather House, 38 Norman Williams Street, Ikoyi, Lagos</td></tr>
        <tr><td style="color:#888; padding:4px 16px 4px 0;">Attending as</td><td>${guests === '2' ? 'Me + 1' : 'Just me'}</td></tr>
      </table>
    </div>
  `
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  let body: { name?: unknown; email?: unknown; guests?: unknown }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const guests: '1' | '2' = body.guests === '2' ? '2' : '1'

  if (!name || !isValidEmail(email)) {
    return new Response('Invalid submission', { status: 400 })
  }

  const store = getStore('rsvps')
  const id = `${Date.now()}-${randomUUID()}`
  await store.setJSON(id, {
    name,
    email,
    guests,
    submittedAt: new Date().toISOString(),
  })

  if (RESEND_API_KEY) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: email,
          subject: "You're in — Being and Becoming",
          html: confirmationEmailHtml(name, guests),
        }),
      })
    } catch (err) {
      console.error('Failed to send confirmation email', err)
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

export const config: Config = {
  path: '/.netlify/functions/rsvp',
}
