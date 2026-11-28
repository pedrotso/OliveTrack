import { db, type LocalTask } from './db'
import { requestSync } from '../sync/sync'

async function write(task: LocalTask, op: 'upsert' | 'delete') {
  const { syncStatus: _s, ...data } = task
  void _s
  await db.transaction('rw', db.tasks, db.outbox, async () => {
    await db.tasks.put(task)
    await db.outbox.add({
      mutationId: crypto.randomUUID(),
      entity: 'task',
      op,
      data,
      createdAt: Date.now(),
    })
  })
  void requestSync()
}

export function addTask(title: string) {
  return write(
    { id: crypto.randomUUID(), title, done: false, updatedAt: Date.now(), deletedAt: null, syncStatus: 'pending' },
    'upsert',
  )
}

export function toggleTask(t: LocalTask) {
  return write({ ...t, done: !t.done, updatedAt: Date.now(), syncStatus: 'pending' }, 'upsert')
}

export function removeTask(t: LocalTask) {
  const now = Date.now()
  return write({ ...t, updatedAt: now, deletedAt: now, syncStatus: 'pending' }, 'delete')
}
