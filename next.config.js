/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'i.ibb.co',
      'firebasestorage.googleapis.com',
      'localhost',
      'localhost969.pythonanywhere.com',
      'res.cloudinary.com'
    ],
    unoptimized: true
  },
  swcMinify: true,
}

module.exports = nextConfig
