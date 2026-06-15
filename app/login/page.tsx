'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-alicerce flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-navy rounded-lg flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-extrabold tracking-tighter">
              if
            </span>
          </div>
          <h1 className="text-white text-xl font-extrabold tracking-tight">
            infotráfego
          </h1>
          <p className="text-ash text-xs uppercase tracking-wider mt-1">
            Inteligência de Dados
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-lg p-6 shadow-xl"
        >
          <h2 className="text-ink text-lg font-extrabold mb-6">
            Entrar
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-ash rounded-md text-sm focus:outline-none focus:border-navy"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-ink mb-1.5"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-ash rounded-md text-sm focus:outline-none focus:border-navy"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-warn text-xs bg-warn-bg p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white py-2.5 rounded-md text-sm font-bold hover:bg-alicerce transition disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <p className="text-ash text-xs text-center mt-6">
          Não tem conta? Pede pro Mickael criar via Supabase Dashboard.
        </p>
      </div>
    </div>
  );
}
