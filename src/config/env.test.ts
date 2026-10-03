import { describe, expect, it } from 'vitest'

import { parseEnv } from './env'

describe('parseEnv', () => {
  it('accepts local provider with defaults', () => {
    const env = parseEnv({
      VITE_APP_NAME: 'Website Ôn Tập',
      VITE_STORAGE_PROVIDER: 'local',
      VITE_BASE_PATH: '/',
    })

    expect(env.VITE_STORAGE_PROVIDER).toBe('local')
    expect(env.VITE_APP_NAME).toBe('Website Ôn Tập')
  })

  it('requires Supabase values when provider is supabase', () => {
    expect(() =>
      parseEnv({
        VITE_STORAGE_PROVIDER: 'supabase',
      }),
    ).toThrow(/VITE_SUPABASE_URL|VITE_SUPABASE_ANON_KEY/i)
  })
})
