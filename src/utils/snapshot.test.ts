import { describe, expect, it } from 'vitest'

import { parseSnapshot } from './snapshot'

const emptySnapshot = {
  version: 1,
  exportedAt: '2026-10-03T00:00:00.000Z',
  folders: [],
  studySets: [],
  items: [],
  progress: [],
  attempts: [],
}

describe('parseSnapshot', () => {
  it('accepts a valid empty backup', () => {
    expect(parseSnapshot(JSON.stringify(emptySnapshot))).toEqual(emptySnapshot)
  })

  it('rejects malformed JSON and snapshots with an unsupported schema', () => {
    expect(parseSnapshot('{not json')).toBeNull()
    expect(parseSnapshot(JSON.stringify({ ...emptySnapshot, version: 2 }))).toBeNull()
  })

  it('rejects records missing required fields before restore', () => {
    expect(parseSnapshot(JSON.stringify({ ...emptySnapshot, folders: [{ id: 'folder-1' }] }))).toBeNull()
  })
})
