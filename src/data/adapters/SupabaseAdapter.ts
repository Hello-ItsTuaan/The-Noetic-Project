import type { Attempt, Folder, Item, Progress, SnapshotData, StudySet } from '../types'
import type { StorageAdapter } from '../StorageAdapter'

export class SupabaseAdapter implements StorageAdapter {
  async clearAll(): Promise<void> {
    throw new Error('Chưa triển khai: LocalAdapter chưa thực thi SupabaseAdapter. TODO: map các bảng folders, study_sets, items, progress, attempts vào Supabase và bật RLS.')
  }

  async createFolder(_data: Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Folder> {
    throw new Error('Chưa triển khai: cần tạo bảng folders trong Supabase và map phương thức createFolder.')
  }

  async listFolders(): Promise<Folder[]> {
    throw new Error('Chưa triển khai: TODO: query folders với owner_id = auth.uid().')
  }

  async getFolder(_id: string): Promise<Folder | null> {
    throw new Error('Chưa triển khai: TODO: map getFolder sang bảng folders.')
  }

  async updateFolder(_id: string, _patch: Partial<Omit<Folder, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Folder> {
    throw new Error('Chưa triển khai: TODO: cập nhật trường updated_at và xóa mềm bằng deleted_at.')
  }

  async deleteFolder(_id: string): Promise<void> {
    throw new Error('Chưa triển khai: TODO: soft delete folder và giữ owner_id.')
  }

  async createStudySet(_data: Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<StudySet> {
    throw new Error('Chưa triển khai: TODO: map sang study_sets table.')
  }

  async listStudySets(_folderId?: string): Promise<StudySet[]> {
    throw new Error('Chưa triển khai: TODO: filter folder_id và deleted_at IS NULL.')
  }

  async getStudySet(_id: string): Promise<StudySet | null> {
    throw new Error('Chưa triển khai: TODO: map query getStudySet.')
  }

  async updateStudySet(_id: string, _patch: Partial<Omit<StudySet, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<StudySet> {
    throw new Error('Chưa triển khai: TODO: update updated_at bằng trigger hoặc client-side.')
  }

  async deleteStudySet(_id: string): Promise<void> {
    throw new Error('Chưa triển khai: TODO: soft delete study_sets.')
  }

  async createItem(_data: Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Item> {
    throw new Error('Chưa triển khai: TODO: map sang bảng items, payload lưu jsonb.')
  }

  async listItems(_studySetId: string): Promise<Item[]> {
    throw new Error('Chưa triển khai: TODO: query items theo study_set_id và order.')
  }

  async getItem(_id: string): Promise<Item | null> {
    throw new Error('Chưa triển khai: TODO: query items theo id.')
  }

  async updateItem(_id: string, _patch: Partial<Omit<Item, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>): Promise<Item> {
    throw new Error('Chưa triển khai: TODO: update item payload trong jsonb.')
  }

  async deleteItem(_id: string): Promise<void> {
    throw new Error('Chưa triển khai: TODO: soft delete item.')
  }

  async upsertProgress(_data: Omit<Progress, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Progress> {
    throw new Error('Chưa triển khai: TODO: upsert progress theo item_id và owner_id.')
  }

  async listProgress(_studySetId: string): Promise<Progress[]> {
    throw new Error('Chưa triển khai: TODO: query progress cho bộ ôn tập.')
  }

  async recordAttempt(_data: Omit<Attempt, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>): Promise<Attempt> {
    throw new Error('Chưa triển khai: TODO: insert vào attempts và tính score/total.')
  }

  async listAttempts(_studySetId: string): Promise<Attempt[]> {
    throw new Error('Chưa triển khai: TODO: query attempts theo study_set_id.')
  }

  async searchStudySets(_query: string): Promise<StudySet[]> {
    throw new Error('Chưa triển khai: TODO: search study_sets bằng ilike hoặc query text.')
  }

  async exportSnapshot(): Promise<SnapshotData> {
    throw new Error('Chưa triển khai: TODO: exportSnapshot để chuyển Local -> Supabase.')
  }

  async importSnapshot(_data: SnapshotData): Promise<void> {
    throw new Error('Chưa triển khai: TODO: importSnapshot từ JSON snapshot vào Supabase.')
  }
}
