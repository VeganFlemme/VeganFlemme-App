/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['images.unsplash.com', 'cdn.greenweez.com'],
  },
  env: {
    CUSTOM_KEY: 'VeganFlemme',
  },
}

module.exports = nextConfig