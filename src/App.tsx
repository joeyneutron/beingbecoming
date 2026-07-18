import { useState, useEffect, useRef } from 'react'
import flyerImage from './imports/david_joel_finihArtboard_1.jpg'

type FormState = 'idle' | 'submitting' | 'success' | 'error'

const RSVP_ENDPOINT = '/.netlify/functions/rsvp'

const GCAL_LINK =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=Being+and+Becoming' +
  '&dates=20260801T130000%2F20260801T190000' +
  '&details=Joel+Nnogo+%26+David+Nnogo+%E2%80%94+The+Gather+House%2C+Ikoyi%2C+Lagos' +
  '&location=38+Norman+Williams+Street%2C+Ikoyi%2C+Lagos'

const MAPS_LINK =
  'https://maps.google.com/?q=38+Norman+Williams+Street,+Ikoyi,+Lagos,+Nigeria'

export const SANS: React.CSSProperties = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
}
export const HEADLINE: React.CSSProperties = { ...SANS, fontWeight: 800 }
const RULE_Y: React.CSSProperties = { borderTop: '3px solid #f2ff00' }
const RULE_DIM: React.CSSProperties = { borderTop: '1px solid #2a2a2a' }

export default function App() {
  const [form, setForm]         = useState({ name: '', email: '', guests: '1' })
  const [state, setState]       = useState<FormState>('idle')
  const [emailErr, setEmailErr] = useState('')
  const [nameErr, setNameErr]   = useState('')
  const [touched, setTouched]   = useState<Record<string, boolean>>({})
  const [copied, setCopied]     = useState(false)
  const submitting               = useRef(false)

  useEffect(() => {
    document.title = 'Being and Becoming — RSVP'
    const metas: [string, string, string][] = [
      ['name',     'description',   'RSVP for Being and Becoming — an exhibition by Joel Nnogo and David Nnogo at The Gather House, Ikoyi, Lagos. August 1, 2026, 1pm–7pm. Free admission.'],
      ['property', 'og:title',      'Being and Becoming'],
      ['property', 'og:description','Joel Nnogo × David Nnogo — The Gather House, Ikoyi, Lagos. August 1, 2026.'],
      ['property', 'og:type',       'website'],
    ]
    const inserted: HTMLMetaElement[] = []
    metas.forEach(([attr, key, content]) => {
      const el = document.createElement('meta')
      el.setAttribute(attr, key)
      el.setAttribute('content', content)
      document.head.appendChild(el)
      inserted.push(el)
    })
    return () => inserted.forEach(el => el.remove())
  }, [])

  const up = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const validateEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Check email format'

  const validateName = (v: string) =>
    v.trim().length > 0 ? '' : 'Name is required'

  const handleBlur = (k: string) => {
    setTouched(p => ({ ...p, [k]: true }))
    if (k === 'email') setEmailErr(validateEmail(form.email))
    if (k === 'name')  setNameErr(validateName(form.name))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting.current) return
    const eErr = validateEmail(form.email)
    const nErr = validateName(form.name)
    setEmailErr(eErr)
    setNameErr(nErr)
    setTouched({ email: true, name: true })
    if (eErr || nErr) return
    submitting.current = true
    setState('submitting')
    try {
      const res = await fetch(RSVP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, exhibition: 'Being and Becoming — 01 Aug 2026' }),
      })
      setState(res.ok ? 'success' : 'error')
    } catch {
      setState('error')
    } finally {
      submitting.current = false
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* silent fail */ }
  }

  const inputStyle = (hasErr: boolean): React.CSSProperties => ({
    ...SANS,
    display: 'block', width: '100%',
    background: 'transparent', border: 'none',
    borderBottom: `1px solid ${hasErr ? '#ff4444' : '#333'}`,
    color: '#e8e3dc', fontSize: 14, padding: '8px 0',
    outline: 'none', letterSpacing: '0.05em',
  })

  const fieldErr = (msg: string, show: boolean) =>
    show && msg ? (
      <p role="alert" style={{ ...SANS, fontSize: 11, color: '#ff4444', marginTop: 5, letterSpacing: '0.15em' }}>
        !! {msg}
      </p>
    ) : null

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>

      {/* ── Flyer ─────────────────────────────────────────── */}
      <img
        src={flyerImage}
        alt="Being and Becoming — Joel Nnogo & David Nnogo exhibition flyer"
        style={{ display: 'block', width: '100%', height: 'auto', aspectRatio: '3/4' }}
      />

      <div style={RULE_Y} />

      {/* ── Two-column body ──────────────────────────────── */}
      <div className="body-grid" style={{
        display: 'grid', gridTemplateColumns: '45fr 55fr',
        position: 'relative', zIndex: 2,
      }}>

        {/* LEFT — Title + info + mobile RSVP bar at bottom */}
        <div style={{ borderRight: '1px solid #333', padding: '40px 40px 0' }}>
          <div style={{
            ...HEADLINE,
            fontSize: 'clamp(40px, 5vw, 78px)',
            lineHeight: 0.87, color: '#f2ff00',
            textTransform: 'uppercase', marginBottom: 32,
          }}>
            BEING<br />AND<br />BECOMING
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', ...SANS }}>
            <tbody>
              <InfoRow label="Date"    value="Saturday, August 1st 2026" />
              <InfoRow label="Time"    value="13:00 — 19:00" />
              <InfoRow label="Venue"   value="The Gather House" />

              <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                <Td>Address</Td>
                <td style={{ ...SANS, fontSize: 12, padding: '14px 0', letterSpacing: '0.08em' }}>
                  <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer"
                    style={{ color: '#e8e3dc', textDecoration: 'none' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f2ff00' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#e8e3dc' }}>
                    38 Norman Williams St<br />Ikoyi, Lagos
                  </a>
                </td>
              </tr>

              <InfoRow label="Curator"       value="Maryam Sulaiman" />
              <InfoRow label="Asst curator"  value="Teniola Emokpae-Ozoro" />
              <InfoRow label="Admission"     value="Free — RSVP required" highlight />

              {([
                ['Joel Nnogo',  '@vapiddood',   'https://www.instagram.com/vapiddood/'],
                ['David Nnogo', '@david_nnogo', 'https://www.instagram.com/david_nnogo/'],
              ] as const).map(([name, handle, url]) => (
                <tr key={name} style={{ borderBottom: '1px solid #2a2a2a' }}>
                  <Td>{name}</Td>
                  <td style={{ fontSize: 12, padding: '14px 0', letterSpacing: '0.08em' }}>
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#f2ff00', textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}>
                      <span style={{ ...SANS }}>{handle}</span>
                      <span style={{ ...SANS, fontSize: 11, color: '#777', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        View work on Instagram
                      </span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile RSVP bar — lives at bottom of left col so it sits
              between info and form when columns stack on mobile */}
          <a href="#rsvp" className="mobile-rsvp-bar" style={{
            ...HEADLINE,
            display: 'none', width: '100%', marginTop: 0,
            padding: '18px 24px', background: '#f2ff00', color: '#000',
            fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase',
            textDecoration: 'none', textAlign: 'center',
          }}>
            RSVP — Reserve your place
          </a>

          {/* Bottom padding shown only on desktop (mobile uses the bar above) */}
          <div className="left-col-pad" style={{ height: 60 }} />
        </div>

        {/* RIGHT — RSVP form */}
        <div id="rsvp" style={{ padding: '40px 48px 60px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 32 }}>
            <span style={{ ...HEADLINE, fontSize: 28, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              RSVP
            </span>
            <span style={{ ...SANS, fontSize: 10, color: '#888', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              — reserve your place
            </span>
          </div>

          {/* aria-live so screen readers catch state changes */}
          <div aria-live="polite" aria-atomic="true">
            {state === 'success' ? (
              <SuccessState name={form.name} copied={copied} onCopy={copyLink} />
            ) : (
              <form onSubmit={handleSubmit} noValidate>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ ...SANS, display: 'block', fontSize: 10, color: '#888', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Full name <span style={{ color: '#f2ff00' }}>*</span>
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={e => { up('name', e.target.value); if (touched.name) setNameErr(validateName(e.target.value)) }}
                    style={inputStyle(!!nameErr && !!touched.name)}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = nameErr && touched.name ? '#ff4444' : '#f2ff00' }}
                    onBlur={e => { handleBlur('name'); (e.currentTarget as HTMLElement).style.borderBottomColor = nameErr ? '#ff4444' : '#333' }}
                    aria-describedby={nameErr && touched.name ? 'name-err' : undefined}
                  />
                  <span id="name-err">{fieldErr(nameErr, !!touched.name)}</span>
                </div>

                <div style={{ marginBottom: 28 }}>
                  <label style={{ ...SANS, display: 'block', fontSize: 10, color: '#888', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Email address <span style={{ color: '#f2ff00' }}>*</span>
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={form.email}
                    onChange={e => { up('email', e.target.value); if (touched.email) setEmailErr(validateEmail(e.target.value)) }}
                    style={inputStyle(!!emailErr && !!touched.email)}
                    onFocus={e => { (e.currentTarget as HTMLElement).style.borderBottomColor = emailErr && touched.email ? '#ff4444' : '#f2ff00' }}
                    onBlur={e => { handleBlur('email'); (e.currentTarget as HTMLElement).style.borderBottomColor = emailErr ? '#ff4444' : '#333' }}
                    aria-describedby={emailErr && touched.email ? 'email-err' : undefined}
                  />
                  <span id="email-err">{fieldErr(emailErr, !!touched.email)}</span>
                </div>

                <div style={{ marginBottom: 36 }}>
                  <p style={{ ...SANS, fontSize: 10, color: '#888', letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 10 }}
                     id="guests-label">
                    Attending as <span style={{ color: '#f2ff00' }}>*</span>
                  </p>
                  <div role="group" aria-labelledby="guests-label" style={{ display: 'flex' }}>
                    {[['1', 'Just me'], ['2', 'Me + 1']].map(([val, lbl]) => (
                      <button
                        key={val}
                        type="button"
                        aria-pressed={form.guests === val}
                        onClick={() => up('guests', val)}
                        style={{
                          ...SANS,
                          padding: '10px 22px', height: 44,
                          background: form.guests === val ? '#f2ff00' : 'transparent',
                          color: form.guests === val ? '#000' : '#999',
                          border: '1px solid',
                          borderColor: form.guests === val ? '#f2ff00' : '#2a2a2a',
                          fontSize: 11, letterSpacing: '0.15em',
                          textTransform: 'uppercase', cursor: 'pointer',
                          marginRight: -1, whiteSpace: 'nowrap',
                        }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={RULE_DIM} />

                {state === 'error' && (
                  <div role="alert" style={{ marginTop: 14 }}>
                    <p style={{ ...SANS, fontSize: 11, color: '#ff4444', letterSpacing: '0.12em' }}>
                      !! Submission failed — check your connection and try again.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === 'submitting'}
                  style={{
                    ...HEADLINE, display: 'block', width: '100%', marginTop: 24,
                    padding: '18px 0',
                    background: state === 'submitting' ? '#b8c400' : '#f2ff00',
                    color: '#000', fontSize: 22, letterSpacing: '0.1em',
                    textTransform: 'uppercase', border: 'none',
                    cursor: state === 'submitting' ? 'wait' : 'pointer',
                  }}
                  onMouseEnter={e => { if (state !== 'submitting') (e.currentTarget as HTMLElement).style.background = '#fff' }}
                  onMouseLeave={e => { if (state !== 'submitting') (e.currentTarget as HTMLElement).style.background = '#f2ff00' }}
                >
                  {state === 'submitting' ? 'Sending...' : 'Confirm attendance'}
                </button>

              </form>
            )}
          </div>
        </div>
      </div>

      <div style={{ ...RULE_Y, position: 'relative', zIndex: 2 }} />

      <div style={{
        ...SANS, padding: '12px 40px', fontSize: 10, color: '#666',
        letterSpacing: '0.15em', display: 'flex', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8, position: 'relative', zIndex: 2,
      }}>
        <span>Gather House — Ikoyi, Lagos</span>
        <span>© 2026</span>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .body-grid { grid-template-columns: 1fr !important; }
          .body-grid > div:first-child {
            border-right: none !important;
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
          .mobile-rsvp-bar { display: block !important; }
          .left-col-pad { display: none !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Helpers ───────────────────────────────────────────── */

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td style={{
      ...SANS, fontSize: 10, color: '#777', padding: '14px 20px 14px 0',
      verticalAlign: 'top', letterSpacing: '0.2em', width: 120,
      textTransform: 'uppercase',
    }}>
      {children}
    </td>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
      <Td>{label}</Td>
      <td style={{ ...SANS, fontSize: 12, padding: '14px 0', letterSpacing: '0.08em', color: highlight ? '#f2ff00' : '#e8e3dc' }}>
        {value}
      </td>
    </tr>
  )
}

function SuccessState({ name, copied, onCopy }: { name: string; copied: boolean; onCopy: () => void }) {
  const first = name.trim().split(' ')[0].toUpperCase()
  return (
    <div>
      <p style={{ ...HEADLINE, fontSize: 'clamp(36px, 4vw, 56px)', lineHeight: 0.9, color: '#f2ff00', textTransform: 'uppercase', marginBottom: 28 }}>
        {first},<br />you're in.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', ...SANS }}>
        <tbody>
          {([
            ['Date',     'Saturday, Aug 1 2026',              null],
            ['Doors',    '13:00 — 19:00',                     null],
            ['Location', '38 Norman Williams St, Ikoyi',      MAPS_LINK],
          ] as [string, string, string | null][]).map(([label, value, href], i) => (
            <tr key={i} style={{ borderBottom: '1px solid #111' }}>
              <td style={{ ...SANS, fontSize: 10, color: '#777', padding: '12px 16px 12px 0', letterSpacing: '0.2em', width: 100, verticalAlign: 'top', textTransform: 'uppercase' }}>
                {label}
              </td>
              <td style={{ ...SANS, fontSize: 12, color: '#e8e3dc', padding: '12px 0', letterSpacing: '0.08em' }}>
                {href
                  ? <a href={href} target="_blank" rel="noopener noreferrer"
                      style={{ color: '#e8e3dc', textDecoration: 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f2ff00' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#e8e3dc' }}>
                      {value}
                    </a>
                  : value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ ...RULE_Y, marginTop: 24, marginBottom: 20 }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <a href={GCAL_LINK} target="_blank" rel="noopener noreferrer"
          style={{ ...SANS, fontSize: 11, color: '#f2ff00', textDecoration: 'none', letterSpacing: '0.18em', textTransform: 'uppercase' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'underline' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.textDecoration = 'none' }}>
          + Add to Google Calendar
        </a>

        <button
          onClick={onCopy}
          style={{
            ...SANS, alignSelf: 'flex-start',
            background: 'transparent', border: '1px solid #2a2a2a',
            color: copied ? '#f2ff00' : '#999',
            fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
            padding: '10px 16px', cursor: 'pointer',
          }}>
          {copied ? '✓ Link copied' : 'Copy RSVP link'}
        </button>

        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {([
            ['Joel — @vapiddood',    'https://www.instagram.com/vapiddood/'],
            ['David — @david_nnogo', 'https://www.instagram.com/david_nnogo/'],
          ] as const).map(([lbl, url]) => (
            <a key={lbl} href={url} target="_blank" rel="noopener noreferrer"
              style={{ ...SANS, fontSize: 11, color: '#666', textDecoration: 'none', letterSpacing: '0.12em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#f2ff00' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#666' }}>
              {lbl}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
