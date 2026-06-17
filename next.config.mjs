/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // ✅ Autorise ton IP locale et le localhost à communiquer avec le serveur de dev
  allowedDevOrigins: ['192.168.1.20', 'localhost', '127.0.0.1'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mc-heads.net',
      },
    ],
  },
}

export default nextConfig