import { useEffect, useState } from 'react'
import { SANS, HEADLINE } from './App'

type Rsvp = {
  name: string
  email: string
  guests: '1' | '2'
  submittedAt: string
}

const SESSION_KEY = 'bb-admin-password'

export default function AdminPage() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(SESSION_KEY) ?? '')
  const [input, setInput] = useState('')
  const [rsvps, setRsvps] = useState<Rsvp[] | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    document.title = 'Being and Becoming — Admin'
  }, [])

  const load = async (pw: string) => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/.netlify/functions/rsvps', {
        headers: { Authorization: `Bearer ${pw}` },
      })
      if (res.status === 401) {
        setError('Wrong password')
        sessionStorage.removeItem(SESSION_KEY)
        setPassword('')
        return
      }
      if (!res.ok) {
        setError('Failed to load RSVPs')
        return
      }
      const data = await res.json()
      setRsvps(data.rsvps)
      sessionStorage.setItem(SESSION_KEY, pw)
      setPassword(pw)
    } catch {
      setError('Failed to load RSVPs')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (password) load(password)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!password) {
    return (
      <div style={{ ...SANS, background: '#000', color: '#e8e3dc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <form
          onSubmit={e => { e.preventDefault(); load(input) }}
          style={{ width: 320 }}
        >
          <p style={{ ...HEADLINE, fontSize: 20, color: '#f2ff00', marginBottom: 16, textTransform: 'uppercase' }}>
            Admin login
          </p>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Password"
            style={{
              ...SANS, display: 'block', width: '100%',
              background: 'transparent', border: '1px solid #333',
              color: '#e8e3dc', fontSize: 14, padding: '10px 12px',
              outline: 'none', marginBottom: 12,
            }}
          />
          {error && <p style={{ color: '#ff4444', fontSize: 12, marginBottom: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...HEADLINE, display: 'block', width: '100%',
              padding: '12px 0', background: '#f2ff00', color: '#000',
              fontSize: 14, border: 'none', textTransform: 'uppercase',
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? 'Checking...' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  const total = rsvps?.length ?? 0
  const guestCount = rsvps?.reduce((sum, r) => sum + (r.guests === '2' ? 2 : 1), 0) ?? 0

  return (
    <div style={{ ...SANS, background: '#000', color: '#e8e3dc', minHeight: '100vh', padding: '32px 40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <p style={{ ...HEADLINE, fontSize: 24, color: '#f2ff00', textTransform: 'uppercase' }}>
          RSVPs — {total} ({guestCount} guests)
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => load(password)}
            style={{ ...SANS, background: 'transparent', border: '1px solid #333', color: '#999', padding: '8px 14px', cursor: 'pointer', fontSize: 12 }}
          >
            Refresh
          </button>
          <button
            onClick={() => { sessionStorage.removeItem(SESSION_KEY); setPassword(''); setRsvps(null) }}
            style={{ ...SANS, background: 'transparent', border: '1px solid #333', color: '#999', padding: '8px 14px', cursor: 'pointer', fontSize: 12 }}
          >
            Log out
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#ff4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {rsvps && rsvps.length === 0 && <p style={{ color: '#777' }}>No RSVPs yet.</p>}

      {rsvps && rsvps.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', textAlign: 'left', color: '#888' }}>
                <th style={{ padding: '8px 16px 8px 0' }}>Name</th>
                <th style={{ padding: '8px 16px 8px 0' }}>Email</th>
                <th style={{ padding: '8px 16px 8px 0' }}>Guests</th>
                <th style={{ padding: '8px 0' }}>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #1a1a1a' }}>
                  <td style={{ padding: '8px 16px 8px 0' }}>{r.name}</td>
                  <td style={{ padding: '8px 16px 8px 0' }}>{r.email}</td>
                  <td style={{ padding: '8px 16px 8px 0' }}>{r.guests === '2' ? 'Me + 1' : 'Just me'}</td>
                  <td style={{ padding: '8px 0', color: '#999' }}>{new Date(r.submittedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
