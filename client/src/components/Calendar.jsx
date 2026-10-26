import { useState } from 'react'
import Icon from './Icon'
import { compareDue, dateKey, formatDate, formatTime, taskDate } from '../lib/planner'

export default function Calendar({ tasks, today, onAdd, onEdit }) {
  const [month, setMonth] = useState(() => { const now = new Date(); return new Date(now.getFullYear(), now.getMonth(), 1) })
  const [selected, setSelected] = useState(today)
  const firstOffset = (month.getDay() + 6) % 7
  const days = Array.from({ length: 42 }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index - firstOffset + 1))
  const selectedTasks = tasks.filter((task) => taskDate(task) === selected).sort(compareDue)
  const counts = tasks.reduce((result, task) => { const key = taskDate(task); result[key] = (result[key] || 0) + 1; return result }, {})
  function moveMonth(direction) {
    const next = new Date(month.getFullYear(), month.getMonth() + direction, 1)
    setMonth(next)
    setSelected(dateKey(next))
  }
  function goToday() {
    const now = new Date(today + 'T00:00:00')
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
    setSelected(today)
  }
  return <div className="calendar-layout">
    <section className="panel calendar-panel">
      <div className="panel-heading"><h2>{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2><div className="calendar-controls"><button className="text-button" onClick={goToday}>Today</button><button className="icon-button" onClick={() => moveMonth(-1)} aria-label="Previous month"><Icon name="left" /></button><button className="icon-button" onClick={() => moveMonth(1)} aria-label="Next month"><Icon name="right" /></button></div></div>
      <div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="calendar-grid">{days.map((day) => {
        const key = dateKey(day)
        return <button key={key} className={'calendar-day' + (day.getMonth() !== month.getMonth() ? ' outside' : '') + (key === today ? ' today' : '') + (selected === key ? ' selected' : '')} onClick={() => setSelected(key)} aria-pressed={selected === key} aria-label={formatDate(key, { month: 'long', year: 'numeric' }) + ', ' + (counts[key] || 0) + ' tasks'}><span>{day.getDate()}</span>{counts[key] ? <small><i />{counts[key]}<span className="calendar-task-word"> tasks</span></small> : null}</button>
      })}</div>
      <div className="calendar-legend"><span><i /> Has tasks</span><span>Choose a day to see your plan</span></div>
    </section>
    <aside className="panel agenda-panel"><p className="eyebrow">THE DAY AHEAD</p><h2>{formatDate(selected, { weekday: 'long', month: 'long' })}</h2><p className="muted">{selectedTasks.length} tasks on your calendar</p>
      <div className="agenda-list">{selectedTasks.length ? selectedTasks.map((task) => <button key={task._id} onClick={() => onEdit(task)} className={'agenda-item' + (task.done ? ' done' : '')}><span className="agenda-time">{formatTime(task.time)} {task.done && <Icon name="check" size={15} />}</span><strong>{task.title}</strong><span>{task.subject}</span><span className={'priority priority-' + (task.priority || 'Medium').toLowerCase()}><span />{task.priority || 'Medium'}</span></button>) : <div className="empty-state"><Icon name="calendar" size={30} /><p>A clear page. Add something you want to work on.</p></div>}</div>
      <button className="button button-dark full-width" onClick={() => onAdd(selected)}><Icon name="plus" size={17} /> Add task for this day</button>
    </aside>
  </div>
}
