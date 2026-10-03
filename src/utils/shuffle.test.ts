import { describe, expect, it } from 'vitest'

import { shuffleItems } from './shuffle'

describe('shuffleItems', () => {
  it('returns a shuffled copy without changing the source array', () => {
    const items = ['a', 'b', 'c']
    const shuffled = shuffleItems(items, () => 0)

    expect(shuffled).toEqual(['b', 'c', 'a'])
    expect(shuffled).not.toBe(items)
    expect(items).toEqual(['a', 'b', 'c'])
  })
})
