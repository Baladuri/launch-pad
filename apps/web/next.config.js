/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@launchpad/db'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
