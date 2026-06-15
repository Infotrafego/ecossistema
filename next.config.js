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
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'ecossistema.servidordainfotrafego.com.br',
      ],
    },
  },
};

module.exports = nextConfig;
