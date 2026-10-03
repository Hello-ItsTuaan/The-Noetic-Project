import type { Item, ItemPayload } from '../data/types'

export function buildQuizQuestion(item: Item) {
  if (item.type === 'card' && typeof item.payload === 'object') {
    const payload = item.payload as { term: string; definition: string }
    return {
      question: payload.term,
      choices: [payload.definition],
      answer: payload.definition,
    }
  }

  if (item.type === 'mcq' && typeof item.payload === 'object') {
    const payload = item.payload as { question: string; options: string[]; correctIndex: number }
    return {
      question: payload.question,
      choices: payload.options,
      answer: payload.options[payload.correctIndex],
    }
  }

  return {
    question: 'Câu hỏi mẫu',
    choices: ['Đáp án mẫu'],
    answer: 'Đáp án mẫu',
  }
}

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[,.;:]/g, '')
}

export function isAnswerCorrect(expected: string, actual: string): boolean {
  return normalizeAnswer(expected) === normalizeAnswer(actual)
}

export function createDistractors(items: Item[], current: Item): string[] {
  const distractorPool = items
    .filter((item) => item.id !== current.id)
    .map((entry) => {
      if (entry.type === 'card') {
        const payload = entry.payload as { definition: string }
        return payload.definition
      }

      if (entry.type === 'mcq') {
        const payload = entry.payload as { options: string[]; correctIndex: number }
        return payload.options[payload.correctIndex]
      }

      return ''
    })
    .filter(Boolean)

  const unique = [...new Set(distractorPool)]
  return unique.slice(0, 3)
}

export function parseSnapshot(input: string): Record<string, unknown> | null {
  if (!input.trim()) return null

  try {
    return JSON.parse(input) as Record<string, unknown>
  } catch {
    return null
  }
}

export function getItemContent(item: Item): string {
  const payload = item.payload as ItemPayload

  if (item.type === 'card') {
    return `${(payload as { term: string }).term}: ${(payload as { definition: string }).definition}`
  }

  if (item.type === 'mcq') {
    return (payload as { question: string }).question
  }

  if (item.type === 'truefalse') {
    return (payload as { statement: string }).statement
  }

  if (item.type === 'essay') {
    return (payload as { question: string }).question
  }

  return 'Nội dung không có sẵn'
}
