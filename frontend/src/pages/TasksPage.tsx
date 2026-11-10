import { useState, type FormEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import { addTask, removeTask, toggleTask } from '../db/tasks'

export default function TasksPage() {
  const [title, setTitle] = useState('')
  const tasks = useLiveQuery(() => db.tasks.filter((t) => !t.deletedAt).reverse().sortBy('updatedAt'), [])
  const pending = useLiveQuery(() => db.outbox.count(), [], 0)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setTitle('')
    await addTask(t)
  }

  return (
    <section>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          className="flex-1 rounded border border-slate-300 px-3 py-2"
          placeholder="Nova tarefa…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button className="rounded bg-indigo-600 px-4 py-2 text-white">Adicionar</button>
      </form>
      <p className="mt-2 text-xs text-slate-500">{pending} alteração(ões) por sincronizar</p>
      <ul className="mt-4 divide-y rounded border border-slate-200 bg-white">
        {tasks?.map((t) => (
          <li key={t.id} className="flex items-center gap-3 px-3 py-2">
            <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} />
            <span className={`flex-1 ${t.done ? 'text-slate-400 line-through' : ''}`}>{t.title}</span>
            {t.syncStatus === 'pending' && <span className="text-xs text-amber-600">pendente</span>}
            <button className="text-sm text-red-600" onClick={() => removeTask(t)}>
              apagar
            </button>
          </li>
        ))}
        {tasks?.length === 0 && <li className="px-3 py-4 text-slate-500">Sem tarefas.</li>}
      </ul>
    </section>
  )
}
