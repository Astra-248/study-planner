import { useEffect, useState } from 'react'
import Icon from './Icon'

const STORAGE_KEY = 'studyspace-focus-v1'
const DEFAULT_TIMER = { duration: 1500, remaining: 1500, endsAt: null, mode: 'focus', sessions: 0 }

// A deadline keeps the timer accurate even when a browser tab is in the background.
function restoreTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || ![300, 1500, 3000].includes(saved.duration) || !Number.isFinite(saved.remaining) || !Number.isInteger(saved.sessions) || saved.sessions < 0 || !['focus', 'break'].includes(saved.mode)) return DEFAULT_TIMER
    if (saved.endsAt !== null && !Number.isFinite(saved.endsAt)) return DEFAULT_TIMER
    const remaining = saved.endsAt ? Math.max(0, Math.ceil((saved.endsAt - Date.now()) / 1000)) : Math.max(0, Math.min(saved.duration, saved.remaining))
    return { ...saved, remaining, endsAt: remaining ? saved.endsAt : null, sessions: saved.sessions + (saved.endsAt && !remaining && saved.mode === 'focus' ? 1 : 0) }
  } catch { return DEFAULT_TIMER }
}

export default function FocusTimer({ hidden }) {
  const [timer, setTimer] = useState(restoreTimer)
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(timer)) } catch { /* Timer still works if browser storage is unavailable. */ }
  }, [timer])
  useEffect(() => {
    if (!timer.endsAt) return
    const interval = setInterval(() => {
      setTimer((current) => {
        if (!current.endsAt) return current
        const remaining = Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000))
        return { ...current, remaining, endsAt: remaining ? current.endsAt : null, sessions: current.sessions + (!remaining && current.mode === 'focus' ? 1 : 0) }
      })
    }, 250)
    return () => clearInterval(interval)
  }, [timer.endsAt])
  function choose(duration, mode) { setTimer((current) => ({ ...current, duration, remaining: duration, mode, endsAt: null })) }
  function toggle() {
    const now = Date.now()
    setTimer((current) => {
      if (current.endsAt) {
        const remaining = Math.max(0, Math.ceil((current.endsAt - now) / 1000))
        return { ...current, remaining, endsAt: null, sessions: current.sessions + (!remaining && current.mode === 'focus' ? 1 : 0) }
      }
      const remaining = current.remaining || current.duration
      return { ...current, remaining, endsAt: now + remaining * 1000 }
    })
  }
  const minutes = String(Math.floor(timer.remaining / 60)).padStart(2, '0')
  const seconds = String(timer.remaining % 60).padStart(2, '0')
  return <section className="focus-layout" hidden={hidden}>
    <div className="focus-main">
      <p className="eyebrow">ONE THING AT A TIME</p><h2>{timer.mode === 'break' ? 'Take a breath.' : 'Find your flow.'}</h2>
      <div className="timer-modes" aria-label="Session length">{[[1500, 'focus', '25 min'], [3000, 'focus', '50 min'], [300, 'break', 'Short break']].map(([duration, mode, label]) => <button key={duration} disabled={Boolean(timer.endsAt)} className={timer.duration === duration ? 'active' : ''} onClick={() => choose(duration, mode)}>{label}</button>)}</div>
      <div className="timer-dial" style={{ '--progress': ((timer.duration - timer.remaining) / timer.duration * 360) + 'deg' }}><div><span className="timer-digits" role="timer" aria-label={minutes + ' minutes ' + seconds + ' seconds'}>{minutes}<span>:</span>{seconds}</span><span className="timer-caption">{timer.endsAt ? 'YOU’RE IN YOUR ZONE' : timer.remaining === 0 ? 'SESSION COMPLETE' : 'A LITTLE TIME, WELL SPENT'}</span></div></div>
      <p className="timer-status" role="status">{timer.remaining === 0 ? (timer.mode === 'break' ? 'Break finished. Ready for a fresh start?' : 'Nicely done. Give yourself a short break.') : timer.endsAt ? 'Your timer keeps running when you switch views.' : 'Choose a session, take a breath, and begin.'}</p>
      <div className="timer-actions"><button className="button button-orange" onClick={toggle}><Icon name={timer.endsAt ? 'pause' : 'play'} size={18} />{timer.endsAt ? 'Pause session' : timer.remaining === timer.duration || timer.remaining === 0 ? 'Start session' : 'Resume session'}</button><button className="icon-button" aria-label="Reset timer" onClick={() => choose(timer.duration, timer.mode)}><Icon name="refresh" /></button></div>
    </div>
    <aside className="focus-notes"><span className="big-star" aria-hidden="true">✳</span><p className="eyebrow">A SMALL RITUAL</p><h3>Good work starts<br />with a little space.</h3><ol><li>Pick one task to work on.</li><li>Put your phone out of reach.</li><li>Stay with it until the timer ends.</li><li>Stretch, get some water, repeat.</li></ol><div className="session-count"><strong>{timer.sessions}</strong><span>focus sessions completed<small>Saved in this browser</small></span></div></aside>
  </section>
}
