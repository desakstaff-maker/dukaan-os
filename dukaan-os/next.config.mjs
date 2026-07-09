/** @type {import('next').NextConfig} */

const nextConfig = {

  reactStrictMode: true,

  experimental: {
    serverActions: {}
  },

  images: {

    remotePatterns: [

      {
        protocol: 'https',
        hostname: '**'
      },

      {
        protocol: 'http',
        hostname: '**'
      }
    ]
  },

  async headers() {

    return [

      {
        source: '/(.*)',

        headers: [

          {
            key:
              'X-Frame-Options',

            value:
              'SAMEORIGIN'
          },

          {
            key:
              'X-Content-Type-Options',

            value:
              'nosniff'
          },

          {
            key:
              'Referrer-Policy',

            value:
              'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  },

  async redirects() {

    return [];
  },

  async rewrites() {

    return [];
  }
};

export default nextConfig;