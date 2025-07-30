/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed experimental.appDir as it is no longer needed in Next.js 14
  images: {
    domains: ['images.unsplash.com', 'cdn.greenweez.com'],
  },
  env: {
    CUSTOM_KEY: 'VeganFlemme',
  },
  // Enable standalone mode for Docker production builds
  output: 'standalone',
}

module.exports = nextConfig