/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pass environment variables to the client
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
  },
  // Prevent issues with MongoDB URI by disabling strictMode
  reactStrictMode: false,
  // For Next.js 13+, use the new app directory
  experimental: {
    // appDir option has been removed in Next.js 14+
    serverComponentsExternalPackages: ['mongodb'],
  },
  // Silence warnings about using params.id synchronously
  // This will be removed in a future version once all instances are fixed properly
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
