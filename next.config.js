/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // Disable Next.js image optimization to use direct URLs
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    domains: [
      'i.ibb.co',
      'firebasestorage.googleapis.com',
      'localhost',
      'localhost969.pythonanywhere.com',
      'res.cloudinary.com'
    ]
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  swcMinify: true,
}

module.exports = nextConfig

