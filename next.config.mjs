/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // 修复 lockfile 警告：明确指定工作区根目录
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
}

export default nextConfig
