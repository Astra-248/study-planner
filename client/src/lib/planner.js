export const EMPTY_TASK = { title: '', subject: '', time: '09:00', dueDate: '', priority: 'Medium' }

// Calendar dates stay in local time; UTC conversion can move them to another day.
export function dateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-')
}
export function taskDate(task) { return task.dueDate?.slice(0, 10) || '' }
export function formatDate(value, options = {}) {
  if (!value) return 'No date'
  return new Date(value.slice(0, 10) + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', ...options })
}
// Support older text times as well as the native time picker.
export function timeInput(value = '') {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!match) return ''
  let hours = Number(match[1])
  const minutes = Number(match[2] || 0)
  if (minutes > 59 || hours > (match[3] ? 12 : 23) || (match[3] && hours < 1)) return ''
  if (match[3]) hours = hours % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)
  return String(hours).padStart(2, '0') + ':' + String(minutes).padStart(2, '0')
}
export function formatTime(value) {
  const parsed = timeInput(value)
  if (!parsed) return value || 'No time'
  const [hours, minutes] = parsed.split(':').map(Number)
  return (hours % 12 || 12) + ':' + String(minutes).padStart(2, '0') + (hours >= 12 ? ' PM' : ' AM')
}
export function isOverdue(task, today) {
  return !task.done && taskDate(task) !== '' && taskDate(task) < today
}
export function compareDue(first, second) {
  const firstKey = (taskDate(first) || '9999-12-31') + 'T' + (timeInput(first.time) || '23:59')
  const secondKey = (taskDate(second) || '9999-12-31') + 'T' + (timeInput(second.time) || '23:59')
  return firstKey.localeCompare(secondKey) || first.title.localeCompare(second.title)
}
export function selectTasks(tasks, { query = '', status = 'all', subject = '', sort = 'due', today = dateKey() } = {}) {
  const search = query.trim().toLocaleLowerCase()
  const rank = { High: 0, Medium: 1, Low: 2 }
  return tasks.filter((task) => {
    if (subject && task.subject !== subject) return false
    if (search && !(task.title + ' ' + task.subject).toLocaleLowerCase().includes(search)) return false
    if (status === 'today') return taskDate(task) === today
    if (status === 'upcoming') return !task.done && taskDate(task) > today
    if (status === 'overdue') return isOverdue(task, today)
    if (status === 'completed') return task.done
    if (status === 'pending') return !task.done
    return true
  }).sort((first, second) => {
    if (sort === 'priority') return (rank[first.priority] ?? 1) - (rank[second.priority] ?? 1) || compareDue(first, second)
    if (sort === 'title') return first.title.localeCompare(second.title)
    return compareDue(first, second)
  })
}
