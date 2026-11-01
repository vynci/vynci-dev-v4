import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/posts'
import { absoluteUrl, postPath } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
  const latest = posts[0]?.updated ?? posts[0]?.date

  return [
    { url: absoluteUrl('/'), lastModified: latest },
    { url: absoluteUrl('/about') },
    ...posts.map((post) => ({
      url: absoluteUrl(postPath(post.slug)),
      lastModified: post.updated ?? post.date
    }))
  ]
}
