import { describe, expect, it } from 'vitest'

import { parseQuizletText } from './import'

describe('parseQuizletText', () => {
  it('parses tab separated cards', () => {
    const cards = parseQuizletText('Hà Nội\tThủ đô của Việt Nam\nOxy\tKhí cần cho hô hấp')

    expect(cards).toHaveLength(2)
    expect(cards[0]).toMatchObject({ term: 'Hà Nội', definition: 'Thủ đô của Việt Nam' })
  })

  it('ignores empty lines and trims whitespace', () => {
    const cards = parseQuizletText('\nMặt trời\tNguồn sáng chính\n \nNước\tChất lỏng quan trọng\n')

    expect(cards).toHaveLength(2)
    expect(cards[1].term).toBe('Nước')
  })
})
