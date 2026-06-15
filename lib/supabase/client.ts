/**
 * Supabase client pro browser (client components)
 * Usa @supabase/ssr pra integração com cookies do Next.js
 */
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import { DB_SCHEMA } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database, typeof DB_SCHEMA>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: DB_SCHEMA } },
  );
}
