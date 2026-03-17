/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  },
  images: {
    domains: ["ui-avatars.com", "avatars.githubusercontent.com"],
  },
};

module.exports = nextConfig;
