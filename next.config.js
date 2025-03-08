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
    appDir: true,
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