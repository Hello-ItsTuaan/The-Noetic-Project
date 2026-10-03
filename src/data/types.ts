export type ItemType = 'card' | 'mcq' | 'truefalse' | 'match' | 'fill' | 'essay'

export interface BaseRecord {
  id: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  ownerId: string | null
}

export interface Folder extends BaseRecord {
  name: string
  color: string
  icon: string
}

export interface StudySet extends BaseRecord {
  folderId: string
  name: string
  description: string
  color: string
  icon: string
  itemIds: string[]
}

export interface CardItemPayload {
  term: string
  definition: string
}

export interface MCQItemPayload {
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

export interface TrueFalsePayload {
  statement: string
  answer: boolean
  explanation?: string
}

export interface MatchPayload {
  title: string
  pairs: Array<[string, string]>
}

export interface FillPayload {
  text: string
  answers: string[]
  explanation?: string
}

export interface EssayPayload {
  question: string
  modelAnswer: string
}

export type ItemPayload =
  | CardItemPayload
  | MCQItemPayload
  | TrueFalsePayload
  | MatchPayload
  | FillPayload
  | EssayPayload

export interface Item extends BaseRecord {
  studySetId: string
  type: ItemType
  order: number
  payload: ItemPayload
}

export interface Progress extends BaseRecord {
  studySetId: string
  itemId: string
  mastery: number
  lastReviewedAt: string | null
}

export interface Attempt extends BaseRecord {
  studySetId: string
  score: number
  total: number
  correctCount: number
  wrongCount: number
  durationSeconds: number
  mode: 'flashcard' | 'test' | 'learn' | 'match'
}

export interface ImportCard {
  term: string
  definition: string
}

export interface SnapshotData {
  version: number
  exportedAt: string
  folders: Folder[]
  studySets: StudySet[]
  items: Item[]
  progress: Progress[]
  attempts: Attempt[]
}
