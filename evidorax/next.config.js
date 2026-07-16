/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk']
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    return config
  }
}

module.exports = nextConfig
