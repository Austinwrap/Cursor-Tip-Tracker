/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['bggsscexogsptcnnwckj.supabase.co'],
    unoptimized: true,
  },
  // Remove static export - we need server-side rendering
  // output: 'export',
  // Ensure CSS modules are properly processed
  webpack: (config) => {
    return config;
  },
  // Ensure trailing slashes are consistent
  trailingSlash: false,
  // App Router is enabled by default in Next.js 14
  // experimental: {
  //   appDir: true,
  // },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig 