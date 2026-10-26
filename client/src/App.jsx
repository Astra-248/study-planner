import { useEffect, useState } from 'react'
import Landing from './components/Landing'
import Icon from './components/Icon'
import Calendar from './components/Calendar'
import FocusTimer from './components/FocusTimer'
import { DeleteDialog, TaskDialog, TaskList } from './components/TaskUI'
import { compareDue, dateKey, formatDate, formatTime, isOverdue, selectTasks, taskDate } from './lib/planner'
import './App.css'

const PAGES = {
  dashboard: { label: 'Dashboard', icon: 'grid', title: 'A fresh page. Your next move.', description: 'A little intention goes a long way. Here’s where things stand.' },
  tasks: { label: 'My tasks', icon: 'tasks', title: 'Make a little progress.', description: 'Everything you need to do, with room to breathe.' },
  subjects: { label: 'Subjects', icon: 'book', title: 'A place for every subject.', description: 'Your tasks, organized by what you’re learning.' },
  schedule: { label: 'Calendar', icon: 'calendar', title: 'See your days take shape.', description: 'Give your deadlines a place on the calendar.' },
  focus: { label: 'Focus', icon: 'clock', title: 'Less noise. More focus.', description: 'Make time for one thing that matters.' },
}
function readPage() { const name = window.location.hash.slice(1); return PAGES[name] ? name : 'home' }
function navigate(page) { window.location.hash = page }

// All views use the same API and the same task state, so edits stay in sync.
const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/tasks'
async function request(path = '', options = {}) {
  let response
  try { response = await fetch(API + path, options) }
  catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Cannot reach your server. Check that the backend is running on port 5000, then try again.', { cause: error })
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.message || 'Something went wrong. Please try again.')
  if (data === null) throw new Error('The server returned an unexpected response. Please try again.')
  return data
}
async function fetchTasks(signal) {
  const data = await request('', { signal })
  if (!Array.isArray(data)) throw new Error('The server did not return a task list.')
  return data
}

export default function App() {
  const [page, setPage] = useState(readPage)
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('studyspace-theme') === 'dark' ? 'dark' : 'light' }
    catch { return 'light' }
  })
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [toast, setToast] = useState('')
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const [subject, setSubject] = useState('')
  const [sort, setSort] = useState('due')
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [busyIds, setBusyIds] = useState([])
  const [today, setToday] = useState(() => dateKey())

  useEffect(() => {
    function onHashChange() { setPage(readPage()) }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  useEffect(() => {
    try { localStorage.setItem('studyspace-theme', theme) }
    catch { /* Keep the selected theme for this visit if browser storage is unavailable. */ }
  }, [theme])
  useEffect(() => {
    document.title = page === 'home' ? 'Studyspace — Space to plan. Time to grow.' : PAGES[page].label + ' · Studyspace'
    window.scrollTo(0, 0)
  }, [page])
  useEffect(() => {
    const interval = setInterval(() => setToday(dateKey()), 30000)
    return () => clearInterval(interval)
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    fetchTasks(controller.signal).then(setTasks).catch((error) => {
      if (!controller.signal.aborted) setLoadError(error.message)
    }).finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])
  useEffect(() => {
    if (!toast) return
    const timeout = setTimeout(() => setToast(''), 4500)
    return () => clearTimeout(timeout)
  }, [toast])

  async function refreshTasks() {
    setLoading(true)
    setLoadError('')
    try { setTasks(await fetchTasks()) } catch (error) { setLoadError(error.message) }
    finally { setLoading(false) }
  }
  async function saveTask(form, id) {
    const saved = await request(id ? '/' + id : '', {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
    })
    setTasks((current) => id ? current.map((task) => task._id === saved._id ? saved : task) : [...current, saved])
    setEditor(null)
    setToast(id ? 'Task updated. Your plan is up to date.' : 'Task added. One step closer.')
  }
  async function toggleTask(task) {
    setBusyIds((current) => [...current, task._id])
    setActionError('')
    try {
      const updated = await request('/' + task._id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ done: !task.done }) })
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item))
      setToast(updated.done ? 'Task complete. That’s progress.' : 'Task marked as incomplete.')
    } catch (error) { setActionError(error.message) }
    finally { setBusyIds((current) => current.filter((id) => id !== task._id)) }
  }
  async function deleteTask(task) {
    await request('/' + task._id, { method: 'DELETE' })
    setTasks((current) => current.filter((item) => item._id !== task._id))
    setDeleting(null)
    setToast('Task deleted.')
  }
  async function clearCompletedTasks() {
    const completedTasks = tasks.filter((task) => task.done)
    if (completedTasks.length === 0) return
    if (!window.confirm(`Delete all ${completedTasks.length} completed tasks? This cannot be undone.`)) return

    const completedIds = completedTasks.map((task) => task._id)
    setBusyIds((current) => [...new Set([...current, ...completedIds])])
    setActionError('')
    try {
      const results = await Promise.allSettled(
          completedTasks.map((task) => request('/' + task._id, { method: 'DELETE' }))
      )
      const deletedIds = completedTasks
          .filter((task, index) => results[index].status === 'fulfilled')
          .map((task) => task._id)
      const failedCount = results.length - deletedIds.length

      setTasks((current) => current.filter((task) => !deletedIds.includes(task._id)))
      if (failedCount > 0) {
        setActionError(`${failedCount} completed task${failedCount === 1 ? '' : 's'} could not be deleted. Try again.`)
      } else {
        setToast(`${deletedIds.length} completed task${deletedIds.length === 1 ? '' : 's'} cleared.`)
      }
    } finally {
      setBusyIds((current) => current.filter((id) => !completedIds.includes(id)))
    }
  }
  function openTasks(nextStatus = 'all', nextSubject = '') {
    setStatus(nextStatus); setSubject(nextSubject); setQuery(''); navigate('tasks')
  }
  function clearFilters() { setQuery(''); setStatus('all'); setSubject('') }

  const subjects = [...new Set(tasks.map((task) => task.subject).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  const complete = tasks.filter((task) => task.done).length
  const todayCount = tasks.filter((task) => taskDate(task) === today && !task.done).length
  const overdueCount = tasks.filter((task) => isOverdue(task, today)).length
  const progress = tasks.length ? Math.round(complete / tasks.length * 100) : 0
  const visibleTasks = selectTasks(tasks, { query, status, subject, sort, today })
  const nextTasks = tasks.filter((task) => !task.done && taskDate(task) >= today).sort(compareDue).slice(0, 3)
  const activeFilters = query.trim() || status !== 'all' || subject
  const taskHandlers = { today, busyIds, onToggle: toggleTask, onEdit: (task) => setEditor({ task }), onDelete: setDeleting }

  if (page === 'home') return <Landing />

  const info = PAGES[page]
  return (
    <div className="app-shell" data-theme={theme}>
      <a className="skip-link" href="#workspace">Skip to content</a>
      <aside className="sidebar">
        <a href="#home" className="brand"><span className="brand-mark">s.</span>studyspace</a>
        <div className="workspace-label"><span className="workspace-avatar">S</span><div>My studyspace<small>Make it a good day.</small></div><span className="workspace-dot" /></div>
        <p className="nav-label">YOUR WORKSPACE</p>
        <nav className="main-nav" aria-label="Planner navigation">{Object.entries(PAGES).map(([key, item]) => <a key={key} href={'#' + key} className={'nav-link' + (page === key ? ' active' : '')} aria-current={page === key ? 'page' : undefined} onClick={() => { if (key === 'tasks') clearFilters() }}><Icon name={item.icon} size={19} /><span>{item.label}</span>{key === 'tasks' && <small>{tasks.length}</small>}{key === 'focus' && <span className="nav-new">NEW</span>}</a>)}</nav>
        <div className="sidebar-bottom"><div className="sidebar-note"><span aria-hidden="true">✳</span><p>A little progress,<br /><em>every single day.</em></p></div><a className="nav-link home-link" href="#home"><Icon name="home" size={18} />Back to home <span>↗</span></a><span className="sidebar-edition">STUDYSPACE / YOUR DAILY EDITION</span></div>
      </aside>
      <main className="main-content" id="workspace" tabIndex={-1}>
        <header className="topbar"><div><span className="breadcrumb">My workspace</span><span className="breadcrumb-slash">/</span><strong>{info.label}</strong></div><div className="topbar-right"><span className="date-label">{formatDate(today, { weekday: 'short', month: 'long' })}</span><button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}><span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span></button><button className="icon-button" aria-label="Refresh tasks" title="Refresh tasks" onClick={refreshTasks} disabled={loading || busyIds.length > 0 || Boolean(editor) || Boolean(deleting)}><Icon name="refresh" size={18} /></button><span className="topbar-avatar">S</span></div></header>
        <div className="page-content">
          <section className="page-heading"><div><p className="eyebrow">{page === 'dashboard' ? 'LET’S MAKE TODAY COUNT' : 'YOUR STUDYSPACE / ' + info.label.toUpperCase()}</p><h1>{info.title}</h1><p>{info.description}</p></div>{page !== 'focus' && <button className="button button-orange" onClick={() => setEditor({})}><Icon name="plus" size={18} />Add task</button>}</section>
          {loadError && <div className="error-banner" role="alert"><Icon name="alert" /><p>{loadError}</p><button className="text-button" disabled={loading} onClick={refreshTasks}>Try again</button></div>}
          {actionError && <div className="error-banner" role="alert"><Icon name="alert" /><p>{actionError}</p><button className="icon-button" aria-label="Dismiss error" onClick={() => setActionError('')}><Icon name="close" size={18} /></button></div>}

          {page === 'dashboard' && <>
            <section className="dashboard-intro">
              <div className="daily-banner"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h2>Good things take focus.<br /><em>You’ve got this.</em></h2><a href="#focus">Find your focus <Icon name="arrow" size={18} /></a></div><span className="banner-orbit" aria-hidden="true"><span>✳</span></span></div>
              <div className="progress-card"><div><span>THE BIG PICTURE</span><Icon name="tasks" size={18} /></div><strong>{loading ? '—' : progress}<small>%</small></strong><p>{complete} of {tasks.length} tasks complete</p><div className="progress-track"><span style={{ width: progress + '%' }} /></div><span className="progress-caption">{tasks.length ? 'Every checkmark is a step forward.' : 'Your first task starts the story.'}</span></div>
            </section>
            <section className="stats" aria-label="Your study overview">
              <button onClick={() => openTasks('today')}><span className="stat-icon orange"><Icon name="calendar" /></span><div><span>Due today</span><strong>{loading ? '—' : todayCount}<small>remaining</small></strong></div><Icon name="arrow" size={16} /></button>
              <button onClick={() => openTasks('overdue')}><span className="stat-icon red"><Icon name="alert" /></span><div><span>Needs attention</span><strong>{loading ? '—' : overdueCount}<small>overdue</small></strong></div><Icon name="arrow" size={16} /></button>
              <button onClick={() => openTasks('completed')}><span className="stat-icon blue"><Icon name="check" /></span><div><span>Completed</span><strong>{loading ? '—' : complete}<small>nice work</small></strong></div><Icon name="arrow" size={16} /></button>
            </section>
          </>}

          {(page === 'dashboard' || page === 'tasks') && <div className={page === 'dashboard' ? 'content-grid' : ''}>
            <section className="panel tasks-panel">
              <div className="panel-heading"><div><p className="eyebrow">A LITTLE MORE ORGANIZED</p><h2>{subject || 'Your task list'}</h2></div><span className="count-label" aria-live="polite">{loading ? 'Loading…' : visibleTasks.length + ' of ' + tasks.length + ' tasks'}</span></div>
              {page === 'tasks' && complete > 0 && <div className="clear-completed-row"><button className="text-button" type="button" onClick={clearCompletedTasks} disabled={loading || busyIds.length > 0 || Boolean(editor) || Boolean(deleting)}>Clear completed ({complete})</button></div>}
              <div className="task-toolbar"><label className="search-field"><Icon name="search" size={18} /><input type="search" aria-label="Search tasks" placeholder="Search tasks or subjects…" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label className="sort-field"><span>Sort</span><select aria-label="Sort tasks" value={sort} onChange={(event) => setSort(event.target.value)}><option value="due">Due date</option><option value="priority">Priority</option><option value="title">Title A–Z</option></select></label></div>
              <div className="filter-row"><div className="task-filters" aria-label="Task status">{[['all', 'All'], ['pending', 'To do'], ['today', 'Today'], ['upcoming', 'Upcoming'], ['overdue', 'Overdue'], ['completed', 'Done']].map(([value, label]) => <button key={value} className={status === value ? 'active' : ''} aria-pressed={status === value} onClick={() => setStatus(value)}>{label}</button>)}</div><select className="subject-filter" aria-label="Filter by subject" value={subject} onChange={(event) => setSubject(event.target.value)}><option value="">All subjects</option>{subjects.map((name) => <option key={name}>{name}</option>)}</select></div>
              {activeFilters && <div className="filter-summary"><span>{subject ? 'Subject: ' + subject : 'Filtered results'}{query.trim() && ' · “' + query.trim() + '”'}</span><button className="text-button" onClick={clearFilters}>Clear filters</button></div>}
              {loading ? <div className="loading-state" role="status"><span className="spinner" />Getting your tasks…</div> : loadError ? <div className="empty-state"><Icon name="alert" size={30} /><h3>Your tasks couldn’t load.</h3><p>Use Try again above once your backend is running.</p></div> : <TaskList tasks={visibleTasks} {...taskHandlers} emptyMessage={activeFilters ? 'No tasks match these filters. Try a different search or clear your filters.' : undefined} />}
              <button className="add-task-row" onClick={() => setEditor({})}><Icon name="plus" size={18} /> Make room for one more task</button>
            </section>
            {page === 'dashboard' && <aside className="dashboard-side"><section className="panel upcoming-panel"><div className="panel-heading"><div><p className="eyebrow">ON THE HORIZON</p><h2>Up next</h2></div><Icon name="calendar" /></div>{loading ? <p className="muted">Loading your plan…</p> : nextTasks.length ? nextTasks.map((task, index) => <button className="upcoming-item" key={task._id} onClick={() => setEditor({ task })}><span className="upcoming-number">0{index + 1}</span><span><strong>{task.title}</strong><small>{task.subject} · {formatDate(task.dueDate)}</small><span>{formatTime(task.time)}</span></span><Icon name="arrow" size={16} /></button>) : <div className="empty-compact"><p>No upcoming deadlines.</p><span>Give your next task a date.</span></div>}<a className="panel-link" href="#schedule">See your calendar <Icon name="arrow" size={16} /></a></section><a className="focus-teaser" href="#focus"><span className="eyebrow">TUNE IN. ZONE OUT.</span><span className="teaser-time">25<span>:00</span></span><div><span>A little time for deep work.</span><span className="round-arrow"><Icon name="arrow" /></span></div></a></aside>}
          </div>}

          {page === 'subjects' && <>{loading ? <div className="loading-state" role="status">Loading your subjects…</div> : subjects.length ? <div className="subject-grid">{subjects.map((name, index) => {
            const items = tasks.filter((task) => task.subject === name)
            const done = items.filter((task) => task.done).length
            const percent = Math.round(done / items.length * 100)
            return <button key={name} className={'subject-card subject-color-' + index % 4} onClick={() => openTasks('all', name)}><div className="subject-card-top"><span>SUBJECT / {String(index + 1).padStart(2, '0')}</span><Icon name="book" size={24} /></div><h2>{name}</h2><p>{items.length - done} remaining · {done} completed</p><div className="progress-track"><span style={{ width: percent + '%' }} /></div><div className="subject-card-bottom"><span>{percent}% complete</span><Icon name="arrow" size={20} /></div></button>
          })}</div> : <div className="panel empty-state"><Icon name="book" size={36} /><h3>What are you learning?</h3><p>Subjects appear here when you add them to a task.</p><button className="button button-orange" onClick={() => setEditor({})}>Add your first task</button></div>}<p className="page-note">Subjects come from your task list. Choose a card to see its tasks.</p></>}

          {page === 'schedule' && <Calendar tasks={tasks} today={today} onAdd={(initialDate) => setEditor({ initialDate })} onEdit={(task) => setEditor({ task })} />}
          <FocusTimer hidden={page !== 'focus'} />
          <footer className="workspace-footer"><span>STUDYSPACE</span><p>One thing at a time. You’re getting there.</p><span>✳</span></footer>
        </div>
      </main>
      {editor && <TaskDialog {...editor} subjects={subjects} onClose={() => setEditor(null)} onSave={saveTask} />}
      {deleting && <DeleteDialog task={deleting} onClose={() => setDeleting(null)} onConfirm={deleteTask} />}
      {toast && <div className="toast" role="status"><Icon name="check" size={18} /><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><Icon name="close" size={16} /></button></div>}
    </div>
  )
}
