/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['randomuser.me'],
  },
  // Ensure CSS modules are properly processed
  webpack: (config) => {
    return config;
  },
  // Ensure trailing slashes are consistent
  trailingSlash: false,
  // Explicitly enable the App Router
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig 