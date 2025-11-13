/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable strict TypeScript checking in production
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configure image optimization with external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },

  // Enable production optimizations
  reactStrictMode: true,

  // Configure output for standalone deployment (optional, good for Docker)
  // output: 'standalone',
}

export default nextConfig
