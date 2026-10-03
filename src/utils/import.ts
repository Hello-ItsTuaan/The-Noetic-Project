import type { ImportCard } from '../data/types'

export function parseQuizletText(input: string, separator = '\t'): ImportCard[] {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const cards: ImportCard[] = []

  for (const line of lines) {
    const parts = line.split(separator)
    const term = parts[0]?.trim() ?? ''
    const definition = parts.slice(1).join(separator).trim() || ''

    if (!term && !definition) continue
    if (!term || !definition) {
      continue
    }

    cards.push({ term, definition })
  }

  return cards
}
