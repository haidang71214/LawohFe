import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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
      {
        source: '/admin/lawyer-requests',
        destination: '/admin?tab=lawyers',
        permanent: false,
      },
      {
        source: '/admin/lawyer_requests',
        destination: '/admin?tab=lawyers',
        permanent: false,
      },
      {
        source: '/admin/lawyers',
        destination: '/admin?tab=lawyers',
        permanent: false,
      },
      {
        source: '/bookingLawyer',
        destination: '/bookingListLawyer',
        permanent: false,
      },
      {
        source: '/myBooking',
        destination: '/bookingList',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
