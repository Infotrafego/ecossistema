/**
 * Supabase client pro server (Server Components, Route Handlers, Server Actions)
 * Gerencia cookies via next/headers
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';
import { DB_SCHEMA } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database, typeof DB_SCHEMA>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: DB_SCHEMA },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll é chamado de Server Component · ignorar
            // (cookies já são setados pelo middleware)
          }
        },
      },
    },
  );
}

/**
 * Client com service role · NUNCA usar em código que roda no browser
 * Usar apenas em Edge Functions e Route Handlers privados
 */
export function createServiceClient() {
  return createServerClient<Database, typeof DB_SCHEMA>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      db: { schema: DB_SCHEMA },
      cookies: { getAll: () => [], setAll: () => {} },
    },
  );
}
