/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'export',
  trailingSlash: true,
  images: {
    domains: [],
    unoptimized: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/edu_anl' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/edu_anl' : '',
}

module.exports = nextConfig

