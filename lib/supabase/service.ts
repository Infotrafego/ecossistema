/**
 * Client Supabase com service role · ignora RLS
 *
 * Separado de `server.ts` de propósito: aquele importa `next/headers`, o que o
 * prende ao ciclo de request. O sync e os jobs de IA rodam fora de request
 * (cron, script CLI), então precisam de um client que não dependa de cookies.
 *
 * ⚠ NUNCA importar isto de um Client Component. A chave é de runtime
 * (Portainer) e dá acesso irrestrito a todos os clientes — é justamente o que
 * o RLS existe pra impedir.
 */

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { DB_SCHEMA } from '@/types/database';

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase service role não configurado (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).',
    );
  }

  return createSupabaseClient<Database, typeof DB_SCHEMA>(url, key, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type ServiceClient = ReturnType<typeof createServiceClient>;
