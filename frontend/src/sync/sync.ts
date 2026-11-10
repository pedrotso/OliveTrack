import type { PullResponse } from '@app/shared'
import { db } from '../db/db'

let running = false
const CURSOR = 'cursor'

async function push() {
  const items = await db.outbox.orderBy('createdAt').limit(100).toArray()
  if (!items.length) return
  const mutations = items.map(({ createdAt: _c, ...m }) => (void _c, m))
  const res = await fetch('/api/sync/push', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) throw new Error(`push ${res.status}`)
  const { applied } = (await res.json()) as { applied: string[] }
  await db.transaction('rw', db.outbox, db.tasks, async () => {
    await db.outbox.bulkDelete(applied)
    // marca como synced as tarefas sem mutações pendentes
    const pendingIds = new Set((await db.outbox.toArray()).map((o) => o.data.id))
    await db.tasks
      .where('syncStatus')
      .equals('pending')
      .filter((t) => !pendingIds.has(t.id))
      .modify({ syncStatus: 'synced' })
  })
  if (items.length === 100) await push()
}

async function pull() {
  const since = (await db.meta.get(CURSOR))?.value ?? 0
  const res = await fetch(`/api/sync/pull?since=${since}`)
  if (!res.ok) throw new Error(`pull ${res.status}`)
  const { tasks, cursor } = (await res.json()) as PullResponse
  await db.transaction('rw', db.tasks, db.outbox, db.meta, async () => {
    const pendingIds = new Set((await db.outbox.toArray()).map((o) => o.data.id))
    for (const t of tasks) {
      if (pendingIds.has(t.id)) continue // alterações locais pendentes ganham até ao push
      const local = await db.tasks.get(t.id)
      if (!local || local.updatedAt <= t.updatedAt) await db.tasks.put({ ...t, syncStatus: 'synced' })
    }
    await db.meta.put({ key: CURSOR, value: cursor })
  })
}

export async function requestSync() {
  if (running || !navigator.onLine) return
  running = true
  try {
    await push()
    await pull()
  } catch (e) {
    console.warn('sync falhou, tenta de novo mais tarde', e)
  } finally {
    running = false
  }
}

export function startSync() {
  const trigger = () => void requestSync()
  window.addEventListener('online', trigger)
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && trigger())
  const id = setInterval(trigger, 30_000)
  trigger()
  return () => {
    window.removeEventListener('online', trigger)
    clearInterval(id)
  }
}
