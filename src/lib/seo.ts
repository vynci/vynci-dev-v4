import type { Metadata } from 'next'
import type { PostSummary } from './posts'
import * as site from './site'

// Without a trailing slash on the root, matching the canonical URL Next.js renders
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString().replace(/\/$/, '')
}

// The site-wide card from app/opengraph-image.tsx. Pages that set `openGraph` replace the
// root segment's file-based image, so they reference it explicitly; posts have their own.
const siteImage = { url: '/opengraph-image', width: 1200, height: 630, alt: site.title }

const rss = { 'application/rss+xml': [{ url: '/rss.xml', title: `${site.name}'s blog` }] }

// Next.js merges metadata shallowly: a page's `openGraph` or `alternates` replaces the
// root layout's. Every page builds them here, so none inherits another page's canonical.
export function pageMetadata({
  path,
  title,
  description = site.description,
  siteCard = true,
  openGraph
}: {
  path: string
  title?: string
  description?: string
  // false when the route has its own opengraph-image file. Even `images: undefined`
  // would override that file, so the key is left out entirely.
  siteCard?: boolean
  openGraph?: Metadata['openGraph']
}): Metadata {
  return {
    // An explicit `title: undefined` would clear the layout's default title
    ...(title && { title }),
    description,
    alternates: { canonical: path, types: rss },
    openGraph: {
      siteName: 'vynci.dev',
      locale: 'en_CA',
      type: 'website',
      url: path,
      title: title ?? site.title,
      description,
      ...(siteCard && { images: [siteImage] }),
      ...openGraph
    },
    twitter: { card: 'summary_large_image', title: title ?? site.title, description }
  }
}

export function postMetadata(post: PostSummary): Metadata {
  return pageMetadata({
    path: postPath(post.slug),
    title: post.title,
    description: post.description,
    // posts/[slug]/opengraph-image.tsx supplies the image
    siteCard: false,
    openGraph: {
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: [absoluteUrl('/about')],
      tags: post.tags
    }
  })
}

export const postPath = (slug: string) => `/posts/${slug}`

// JSON-LD (schema.org)

const person = {
  '@type': 'Person',
  '@id': absoluteUrl('/#person'),
  name: site.name,
  url: absoluteUrl('/about'),
  image: absoluteUrl(site.avatar),
  jobTitle: 'Software and hardware engineer',
  sameAs: [`https://github.com/${site.github}`, `https://www.linkedin.com/${site.linkedin}`]
}

const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes })

export function homeJsonLd() {
  return graph(person, {
    '@type': 'WebSite',
    '@id': absoluteUrl('/#website'),
    url: absoluteUrl('/'),
    name: 'vynci.dev',
    description: site.description,
    inLanguage: 'en',
    author: { '@id': person['@id'] }
  })
}

export function aboutJsonLd() {
  return graph({
    '@type': 'ProfilePage',
    url: absoluteUrl('/about'),
    name: `About ${site.name}`,
    mainEntity: person
  })
}

export function postJsonLd(post: PostSummary) {
  const url = absoluteUrl(postPath(post.slug))
  const author = { '@type': 'Person', name: site.name, url: absoluteUrl('/about') }
  return graph(
    {
      '@type': 'BlogPosting',
      headline: post.title,
      description: post.description,
      url,
      mainEntityOfPage: url,
      image: absoluteUrl(`${postPath(post.slug)}/opengraph-image`),
      datePublished: post.date,
      dateModified: post.updated ?? post.date,
      wordCount: post.wordCount,
      inLanguage: 'en',
      keywords: post.tags.length ? post.tags : undefined,
      author,
      publisher: author
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: post.title, item: url }
      ]
    }
  )
}
