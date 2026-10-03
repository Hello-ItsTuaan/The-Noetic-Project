import { z } from 'zod'

const envServerSchema = z.object({
  VITE_APP_NAME: z.string().default('Website Ôn Tập'),
  VITE_STORAGE_PROVIDER: z.enum(['local', 'supabase']).default('local'),
  VITE_BASE_PATH: z.string().default('/'),
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10).optional(),
})

export type AppEnv = z.infer<typeof envServerSchema>

export function parseEnv(input: Record<string, string | undefined>): AppEnv {
  const normalized = {
    VITE_APP_NAME: input.VITE_APP_NAME ?? 'Website Ôn Tập',
    VITE_STORAGE_PROVIDER: (input.VITE_STORAGE_PROVIDER ?? 'local') as 'local' | 'supabase',
    VITE_BASE_PATH: input.VITE_BASE_PATH ?? '/',
    VITE_SUPABASE_URL: input.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: input.VITE_SUPABASE_ANON_KEY,
  }

  const parsed = envServerSchema.safeParse(normalized)

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => issue.path.join('.') || 'environment')
      .join(', ')
    throw new Error(`Cấu hình môi trường không hợp lệ: ${details}. Vui lòng kiểm tra .env và biến VITE_*.`)
  }

  if (parsed.data.VITE_STORAGE_PROVIDER === 'supabase') {
    if (!parsed.data.VITE_SUPABASE_URL || !parsed.data.VITE_SUPABASE_ANON_KEY) {
      throw new Error(
        'VITE_STORAGE_PROVIDER=supabase cần VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY. Hãy thêm trong .env.local hoặc cấu hình deploy.',
      )
    }
  }

  return parsed.data
}

export const env = parseEnv(import.meta.env)
