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
    remotePatterns: [new URL('https://media.vynci.dev/posts/**')]
  },
  // Post pages read Markdown at runtime for slugs not prerendered (they 404)
  outputFileTracingIncludes: {
    '/posts/[slug]': ['./posts/**/*.md'],
    '/posts/[slug]/opengraph-image': ['./posts/**/*.md', './src/assets/fonts/*']
  },
  async redirects() {
    return [
      // The SvelteKit sitemap listed every post under /post/ (a 404); search engines may have it
      { source: '/post/:slug', destination: '/posts/:slug', permanent: true },
      { source: '/posts', destination: '/', permanent: true }
    ]
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
