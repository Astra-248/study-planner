import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { EMPTY_TASK, dateKey, formatDate, formatTime, isOverdue, taskDate, timeInput } from '../lib/planner'

export function TaskList({ tasks, today, busyIds, onToggle, onEdit, onDelete, emptyMessage = 'Nothing here yet. Add your first task to get started.' }) {
  if (!tasks.length) return <div className="empty-state"><Icon name="tasks" size={34} /><h3>A little breathing room.</h3><p>{emptyMessage}</p></div>
  return <div className="task-list">{tasks.map((task) => {
    const overdue = isOverdue(task, today)
    return <article className={'task-row' + (task.done ? ' done' : '')} key={task._id}>
      <label className="task-check"><input type="checkbox" checked={Boolean(task.done)} disabled={busyIds.includes(task._id)} onChange={() => onToggle(task)} aria-label={(task.done ? 'Mark incomplete: ' : 'Complete: ') + task.title} /><span><Icon name="check" size={14} /></span></label>
      <div className="task-copy"><strong>{task.title}</strong><div className="task-meta"><span className="subject-tag">{task.subject}</span><span className={overdue ? 'overdue-text' : ''}>{overdue ? 'Overdue · ' : ''}{taskDate(task) === today ? 'Today' : formatDate(task.dueDate)} · {formatTime(task.time)}</span></div></div>
      <span className={'priority priority-' + (task.priority || 'Medium').toLowerCase()}><span />{task.priority || 'Medium'}</span>
      <div className="task-actions"><button className="icon-button" aria-label={'Edit ' + task.title} title="Edit task" onClick={() => onEdit(task)} disabled={busyIds.includes(task._id)}><Icon name="edit" size={17} /></button><button className="icon-button danger" aria-label={'Delete ' + task.title} title="Delete task" onClick={() => onDelete(task)} disabled={busyIds.includes(task._id)}><Icon name="trash" size={17} /></button></div>
    </article>
  })}</div>
}

export function TaskDialog({ task, initialDate, subjects, onSave, onClose }) {
  const dialog = useRef(null)
  const [form, setForm] = useState(() => task ? {
    title: task.title, subject: task.subject, priority: task.priority || 'Medium',
    dueDate: taskDate(task), time: timeInput(task.time),
  } : { ...EMPTY_TASK, dueDate: initialDate || dateKey() })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    const element = dialog.current
    element.showModal()
    return () => element.close()
  }, [])
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  async function submit(event) {
    event.preventDefault()
    if (!form.title.trim() || !form.subject.trim()) { setError('Please enter a task title and subject.'); return }
    setSaving(true)
    setError('')
    try { await onSave({ ...form, title: form.title.trim(), subject: form.subject.trim() }, task?._id) }
    catch (failure) { setError(failure.message) }
    finally { setSaving(false) }
  }
  return <dialog ref={dialog} className="modal" aria-labelledby="task-dialog-title" onCancel={(event) => { event.preventDefault(); if (!saving) onClose() }}>
    <div className="modal-header"><div><p className="eyebrow">MAKE A LITTLE ROOM</p><h2 id="task-dialog-title">{task ? 'Edit your task.' : 'What’s the plan?'}</h2></div><button className="icon-button" onClick={onClose} disabled={saving} aria-label="Close task form"><Icon name="close" /></button></div>
    <form onSubmit={submit} className="task-form">
      <label>Task title<input autoFocus name="title" value={form.title} onChange={update} maxLength={180} placeholder="e.g. Revise chapter 4" required /></label>
      <label>Subject<input name="subject" value={form.subject} onChange={update} list="existing-subjects" maxLength={80} placeholder="e.g. Mathematics" required /><datalist id="existing-subjects">{subjects.map((subject) => <option key={subject} value={subject} />)}</datalist></label>
      <div className="form-grid"><label>Due date<input name="dueDate" type="date" value={form.dueDate} onChange={update} required /></label><label>Time<input name="time" type="time" value={form.time} onChange={update} required /></label></div>
      <label>Priority<select name="priority" value={form.priority} onChange={update}><option>Low</option><option>Medium</option><option>High</option></select></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-footer"><button type="button" className="button button-quiet" onClick={onClose} disabled={saving}>Cancel</button><button className="button button-orange" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Add task'}{!saving && <Icon name="arrow" size={18} />}</button></div>
    </form>
  </dialog>
}

export function DeleteDialog({ task, onConfirm, onClose }) {
  const dialog = useRef(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => { const element = dialog.current; element.showModal(); return () => element.close() }, [])
  async function confirm() {
    setBusy(true)
    try { await onConfirm(task) } catch (failure) { setError(failure.message) }
    finally { setBusy(false) }
  }
  return <dialog className="modal delete-modal" ref={dialog} aria-labelledby="delete-title" onCancel={(event) => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="delete-symbol"><Icon name="trash" size={28} /></div><h2 id="delete-title">Delete this task?</h2><p>“{task.title}” will be removed from your planner. This cannot be undone.</p>
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="modal-footer"><button autoFocus className="button button-quiet" disabled={busy} onClick={onClose}>Keep task</button><button className="button button-danger" disabled={busy} onClick={confirm}>{busy ? 'Deleting…' : 'Delete task'}</button></div>
  </dialog>
}
