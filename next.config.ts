import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // avatares Google
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig