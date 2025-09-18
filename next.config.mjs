/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  redirects: async () => [
    { source: "/", destination: "/ru", permanent: false }
  ]
};
export default nextConfig;