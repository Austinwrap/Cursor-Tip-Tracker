/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['randomuser.me', 'bggsscexogsptcnnwckj.supabase.co'],
  },
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