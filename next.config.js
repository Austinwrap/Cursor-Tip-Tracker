/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['bggsscexogsptcnnwckj.supabase.co'],
    unoptimized: true,
  },
  // Use static export for Netlify
  output: 'export',
  // Disable server components since we're using static export
  experimental: {
    // appDir is now the default in Next.js 14+, so we don't need to specify it
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Better Netlify compatibility
  poweredByHeader: false,
}

module.exports = nextConfig 