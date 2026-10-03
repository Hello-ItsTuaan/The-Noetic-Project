import { z } from 'zod'

import type { SnapshotData } from '../data/types'

const baseRecordSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable(),
  ownerId: z.string().nullable(),
})

const itemBaseSchema = baseRecordSchema.extend({
  studySetId: z.string(),
  order: z.number(),
})

const itemSchema = z.discriminatedUnion('type', [
  itemBaseSchema.extend({
    type: z.literal('card'),
    payload: z.object({ term: z.string(), definition: z.string() }),
  }),
  itemBaseSchema.extend({
    type: z.literal('mcq'),
    payload: z.object({ question: z.string(), options: z.array(z.string()), correctIndex: z.number(), explanation: z.string().optional() }),
  }),
  itemBaseSchema.extend({
    type: z.literal('truefalse'),
    payload: z.object({ statement: z.string(), answer: z.boolean(), explanation: z.string().optional() }),
  }),
  itemBaseSchema.extend({
    type: z.literal('match'),
    payload: z.object({ title: z.string(), pairs: z.array(z.tuple([z.string(), z.string()])) }),
  }),
  itemBaseSchema.extend({
    type: z.literal('fill'),
    payload: z.object({ text: z.string(), answers: z.array(z.string()), explanation: z.string().optional() }),
  }),
  itemBaseSchema.extend({
    type: z.literal('essay'),
    payload: z.object({ question: z.string(), modelAnswer: z.string() }),
  }),
])

const snapshotSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  folders: z.array(baseRecordSchema.extend({
    name: z.string(),
    color: z.string(),
    icon: z.string(),
  })),
  studySets: z.array(baseRecordSchema.extend({
    folderId: z.string(),
    name: z.string(),
    description: z.string(),
    color: z.string(),
    icon: z.string(),
    itemIds: z.array(z.string()),
  })),
  items: z.array(itemSchema),
  progress: z.array(baseRecordSchema.extend({
    studySetId: z.string(),
    itemId: z.string(),
    mastery: z.number(),
    lastReviewedAt: z.string().nullable(),
  })),
  attempts: z.array(baseRecordSchema.extend({
    studySetId: z.string(),
    score: z.number(),
    total: z.number(),
    correctCount: z.number(),
    wrongCount: z.number(),
    durationSeconds: z.number(),
    mode: z.enum(['flashcard', 'test', 'learn', 'match']),
  })),
})

export function parseSnapshot(input: string): SnapshotData | null {
  try {
    const parsed: unknown = JSON.parse(input)
    const result = snapshotSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
