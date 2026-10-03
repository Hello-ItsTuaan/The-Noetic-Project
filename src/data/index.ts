import type { StorageAdapter } from './StorageAdapter'
import { LocalAdapter } from './adapters/LocalAdapter'
import { SupabaseAdapter } from './adapters/SupabaseAdapter'
import { env } from '../config/env'

export function createStorageAdapter(): StorageAdapter {
  if (env.VITE_STORAGE_PROVIDER === 'supabase') {
    return new SupabaseAdapter()
  }

  return new LocalAdapter()
}

export const storage = createStorageAdapter()
