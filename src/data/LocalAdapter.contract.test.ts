import 'fake-indexeddb/auto'

import { beforeEach, describe, expect, it } from 'vitest'

import { LocalAdapter } from './adapters/LocalAdapter'

describe('LocalAdapter contract', () => {
  let adapter: LocalAdapter

  beforeEach(async () => {
    adapter = new LocalAdapter()
    await adapter.clearAll()
  })

  it('creates, lists and updates folders and study sets', async () => {
    const folder = await adapter.createFolder({
      name: 'KHTN',
      color: '#22c55e',
      icon: '🧪',
      ownerId: null,
    })

    const set = await adapter.createStudySet({
      folderId: folder.id,
      name: 'Sinh học',
      description: 'Bộ ôn tập cơ bản',
      color: '#8b5cf6',
      icon: '📘',
      ownerId: null,
      itemIds: [],
    })

    expect(folder.name).toBe('KHTN')
    expect(set.name).toBe('Sinh học')

    const savedSets = await adapter.listStudySets(folder.id)
    expect(savedSets).toHaveLength(1)

    const updated = await adapter.updateStudySet(set.id, { name: 'Sinh học nâng cao' })
    expect(updated.name).toBe('Sinh học nâng cao')
  })
})
