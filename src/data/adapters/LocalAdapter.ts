import Dexie, { type Table } from 'dexie'

import type { Attempt, Folder, Item, Progress, SnapshotData, StudySet } from '../types'
import type { StorageAdapter } from '../StorageAdapter'

class StudyDb extends Dexie {
  folders!: Table<Folder>
  studySets!: Table<StudySet>
  items!: Table<Item>
  progress!: Table<Progress>
  attempts!: Table<Attempt>

  constructor() {
    super('website-on-tap-db')
    this.version(1).stores({
      folders: 'id, ownerId, createdAt, updatedAt, deletedAt, name',
      studySets: 'id, ownerId, folderId, createdAt, updatedAt, deletedAt, name',
      items: 'id, ownerId, studySetId, type, createdAt, updatedAt, deletedAt, order',
      progress: 'id, ownerId, studySetId, itemId, createdAt, updatedAt, deletedAt',
      attempts: 'id, ownerId, studySetId, createdAt, updatedAt, deletedAt, mode',
    })
  }
}

function createId(): string {
  const cryptoObject = globalThis.crypto
  if (cryptoObject && 'randomUUID' in cryptoObject) {
    return cryptoObject.randomUUID()
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function nowIso(): string {
  return new Date().toISOString()
}

export class LocalAdapter implements StorageAdapter {
  db = new StudyDb()

  async clearAll(): Promise<void> {
    await this.db.transaction('rw', this.db.folders, this.db.studySets, this.db.items, this.db.progress, this.db.attempts, async () => {
      await this.db.folders.clear()
      await this.db.studySets.clear()
      await this.db.items.clear()
      await this.db.progress.clear()
      await this.db.attempts.clear()
    })
  }

  async createFolder(data: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Folder> {
    const folder: Folder = {
      ...data,
      id: createId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    }

    await this.db.folders.add(folder)
    return folder
  }

  async listFolders(): Promise<Folder[]> {
    return this.db.folders.filter((folder) => folder.deletedAt === null).toArray()
  }

  async getFolder(id: string): Promise<Folder | null> {
    const folder = await this.db.folders.get(id)
    return folder ?? null
  }

  async updateFolder(id: string, patch: Partial<Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Folder> {
    const existing = await this.db.folders.get(id)
    if (!existing) throw new Error('Thư mục không tồn tại.')

    const next: Folder = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    }

    await this.db.folders.put(next)
    return next
  }

  async deleteFolder(id: string): Promise<void> {
    const current = await this.db.folders.get(id)
    if (!current) return

    await this.db.folders.update(id, { deletedAt: nowIso(), updatedAt: nowIso() })
  }

  async createStudySet(data: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<StudySet> {
    const set: StudySet = {
      ...data,
      id: createId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
      color: data.color ?? '#7c3aed',
      icon: data.icon ?? '📘',
      itemIds: data.itemIds ?? [],
    }

    await this.db.studySets.add(set)
    return set
  }

  async listStudySets(folderId?: string): Promise<StudySet[]> {
    const sets = await this.db.studySets.filter((set) => set.deletedAt === null).toArray()
    if (folderId) {
      return sets.filter((set) => set.folderId === folderId)
    }
    return sets
  }

  async getStudySet(id: string): Promise<StudySet | null> {
    const studySet = await this.db.studySets.get(id)
    return studySet ?? null
  }

  async updateStudySet(id: string, patch: Partial<Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<StudySet> {
    const existing = await this.db.studySets.get(id)
    if (!existing) throw new Error('Bộ ôn tập không tồn tại.')

    const next: StudySet = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    }

    await this.db.studySets.put(next)
    return next
  }

  async deleteStudySet(id: string): Promise<void> {
    const current = await this.db.studySets.get(id)
    if (!current) return

    await this.db.studySets.update(id, { deletedAt: nowIso(), updatedAt: nowIso() })
  }

  async createItem(data: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Item> {
    const item: Item = {
      ...data,
      id: createId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    }

    await this.db.items.add(item)
    return item
  }

  async listItems(studySetId: string): Promise<Item[]> {
    const items = await this.db.items.where('studySetId').equals(studySetId).toArray()
    return items.filter((item) => item.deletedAt === null).sort((a, b) => a.order - b.order)
  }

  async getItem(id: string): Promise<Item | null> {
    const item = await this.db.items.get(id)
    return item ?? null
  }

  async updateItem(id: string, patch: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Item> {
    const existing = await this.db.items.get(id)
    if (!existing) throw new Error('Thẻ không tồn tại.')

    const next: Item = {
      ...existing,
      ...patch,
      updatedAt: nowIso(),
    }

    await this.db.items.put(next)
    return next
  }

  async deleteItem(id: string): Promise<void> {
    const current = await this.db.items.get(id)
    if (!current) return

    await this.db.items.update(id, { deletedAt: nowIso(), updatedAt: nowIso() })
  }

  async upsertProgress(data: Omit<Progress, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Progress> {
    const record = await this.db.progress.where('itemId').equals(data.itemId).first()
    const next: Progress = {
      ...record,
      ...data,
      id: record?.id ?? createId(),
      createdAt: record?.createdAt ?? nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
      lastReviewedAt: data.lastReviewedAt ?? nowIso(),
    }

    await this.db.progress.put(next)
    return next
  }

  async listProgress(studySetId: string): Promise<Progress[]> {
    const items = await this.db.progress.where('studySetId').equals(studySetId).toArray()
    return items.filter((item) => item.deletedAt === null)
  }

  async recordAttempt(data: Omit<Attempt, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Attempt> {
    const attempt: Attempt = {
      ...data,
      id: createId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    }

    await this.db.attempts.add(attempt)
    return attempt
  }

  async listAttempts(studySetId: string): Promise<Attempt[]> {
    const attempts = await this.db.attempts.where('studySetId').equals(studySetId).toArray()
    return attempts.filter((item) => item.deletedAt === null)
  }

  async searchStudySets(query: string): Promise<StudySet[]> {
    const term = query.trim().toLowerCase()
    if (!term) return this.listStudySets()

    const all = await this.db.studySets.filter((set) => set.deletedAt === null).toArray()
    return all.filter((set) => set.name.toLowerCase().includes(term) || set.description.toLowerCase().includes(term))
  }

  async exportSnapshot(): Promise<SnapshotData> {
    const [folders, studySets, items, progress, attempts] = await Promise.all([
      this.db.folders.toArray(),
      this.db.studySets.toArray(),
      this.db.items.toArray(),
      this.db.progress.toArray(),
      this.db.attempts.toArray(),
    ])

    return {
      version: 1,
      exportedAt: nowIso(),
      folders,
      studySets,
      items,
      progress,
      attempts,
    }
  }

  async importSnapshot(data: SnapshotData): Promise<void> {
    await this.clearAll()
    await this.db.transaction('rw', this.db.folders, this.db.studySets, this.db.items, this.db.progress, this.db.attempts, async () => {
      if (data.folders.length > 0) await this.db.folders.bulkAdd(data.folders)
      if (data.studySets.length > 0) await this.db.studySets.bulkAdd(data.studySets)
      if (data.items.length > 0) await this.db.items.bulkAdd(data.items)
      if (data.progress.length > 0) await this.db.progress.bulkAdd(data.progress)
      if (data.attempts.length > 0) await this.db.attempts.bulkAdd(data.attempts)
    })
  }
}
