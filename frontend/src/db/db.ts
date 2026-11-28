import Dexie, { type EntityTable } from 'dexie'
import type { Mutation, Task } from '@app/shared'

export type SyncStatus = 'synced' | 'pending'
export type LocalTask = Task & { syncStatus: SyncStatus }
export type OutboxItem = Mutation & { createdAt: number }
export type Meta = { key: string; value: number }

class AppDB extends Dexie {
  tasks!: EntityTable<LocalTask, 'id'>
  outbox!: EntityTable<OutboxItem, 'mutationId'>
  meta!: EntityTable<Meta, 'key'>

  constructor() {
    super('app-db')
    this.version(1).stores({
      tasks: 'id, updatedAt, syncStatus, deletedAt',
      outbox: 'mutationId, createdAt',
      meta: 'key',
    })
  }
}

export const db = new AppDB()
