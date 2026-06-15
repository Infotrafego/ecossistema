/**
 * Middleware Supabase · refresh dos tokens + proteção de rotas
 * Chamado pelo middleware.ts da raiz do projeto
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { DB_SCHEMA } from '@/types/database';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database, typeof DB_SCHEMA>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: DB_SCHEMA },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: chamar getUser() entre supabase.createServerClient() e retornar
  // a response · sem isso os tokens podem expirar prematuramente
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Rotas protegidas · sem user redireciona pro login
  const pathname = request.nextUrl.pathname;
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/api/auth');

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Usuário logado tentando acessar /login · redireciona pro dashboard
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
