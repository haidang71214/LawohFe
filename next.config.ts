import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/news/:id',
        destination: '/newsDetail/:id',
        permanent: false,
      },
      {
        source: '/news',
        destination: '/newsPage',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
