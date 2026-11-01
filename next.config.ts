import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  env: {
    // Footer copyright year
    BUILD_YEAR: String(new Date().getFullYear())
  },
  images: {
    // Post media CDN (see src/lib/media.ts)
    remotePatterns: [
      new URL('https://media.vynci.dev/posts/**'),
      new URL('https://d203yvyxkx65mq.cloudfront.net/posts/**')
    ]
  },
  // Post pages read Markdown at runtime for slugs not prerendered (they 404)
  outputFileTracingIncludes: {
    '/posts/[slug]': ['./posts/**/*.md']
  },
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      }
    }
  }
}

export default nextConfig
