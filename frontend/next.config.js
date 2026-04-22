/** @type {import('next').NextConfig} */
// FIX: added via.placeholder.com (used in seed data screenshots) and
//      removed manual env re-exports (Next.js reads NEXT_PUBLIC_* automatically).
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        // Used by seed data placeholder images
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },
};

module.exports = nextConfig;
