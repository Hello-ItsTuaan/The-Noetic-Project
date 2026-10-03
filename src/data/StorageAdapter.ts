import type { Attempt, Folder, Item, Progress, SnapshotData, StudySet } from './types'

export type FolderInput = Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
export type StudySetInput = Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
export type ItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export interface StorageAdapter {
  clearAll(): Promise<void>

  createFolder(data: FolderInput): Promise<Folder>
  listFolders(): Promise<Folder[]>
  getFolder(id: string): Promise<Folder | null>
  updateFolder(id: string, patch: Partial<FolderInput>): Promise<Folder>
  deleteFolder(id: string): Promise<void>

  createStudySet(data: StudySetInput): Promise<StudySet>
  listStudySets(folderId?: string): Promise<StudySet[]>
  getStudySet(id: string): Promise<StudySet | null>
  updateStudySet(id: string, patch: Partial<StudySetInput>): Promise<StudySet>
  deleteStudySet(id: string): Promise<void>

  createItem(data: ItemInput): Promise<Item>
  listItems(studySetId: string): Promise<Item[]>
  getItem(id: string): Promise<Item | null>
  updateItem(id: string, patch: Partial<ItemInput>): Promise<Item>
  deleteItem(id: string): Promise<void>

  upsertProgress(data: Omit<Progress, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Progress>
  listProgress(studySetId: string): Promise<Progress[]>

  recordAttempt(data: Omit<Attempt, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Attempt>
  listAttempts(studySetId: string): Promise<Attempt[]>

  searchStudySets(query: string): Promise<StudySet[]>
  exportSnapshot(): Promise<SnapshotData>
  importSnapshot(data: SnapshotData): Promise<void>
}
