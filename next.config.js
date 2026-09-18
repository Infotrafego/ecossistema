/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build slim pro Docker (server.js + .next/standalone)
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.fbcdn.net' },
      { protocol: 'https', hostname: 'scontent.cdninstagram.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  experimental: {
    // Necessario pro instrumentation.ts, que sobe o agendador do sync diario
    // junto com o servidor (ver lib/meta-ads/agendador.ts).
    instrumentationHook: true,
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'ecossistema.servidordainfotrafego.com.br',
      ],
    },
  },
};

module.exports = nextConfig;
