// Loads posts from posts/<slug>/index.md (or posts/<slug>.md).
//
// Everything here is synchronous on purpose: with Cache Components, synchronous file
// reads and pure computation are prerendered automatically, and `next dev` always shows
// the current Markdown (a `use cache` entry would only refresh on a code change).

import 'server-only'
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import matter from 'gray-matter'
import type { Root } from 'hast'
import readingTime from 'reading-time'
import { cache } from 'react'
import { z } from 'zod'
import manifestJson from '../../media-manifest.json'
import { renderMarkdown, type Heading, type MediaResolver } from './markdown'
import { isVideo, mediaUrl, type MediaManifest } from './media'

const root = process.cwd()
const postsDir = join(root, 'posts')
const manifest = manifestJson as MediaManifest
const isDev = process.env.NODE_ENV === 'development'

export interface PostSummary {
  slug: string
  title: string
  date: string // YYYY-MM-DD
  updated?: string
  description: string
  excerptHtml: string
  authorName: string
  authorPosition: string
  tags: string[]
  readingTime: string
  wordCount: number
  headings: Heading[]
}

export interface Post extends PostSummary {
  hast: Root
  previous?: { slug: string; title: string }
  next?: { slug: string; title: string }
}

// Dates: YYYY-MM-DD strings, '2022-10-7' style, or unquoted YAML dates (parsed as UTC)
const date = z.union([z.string().regex(/^\d{4}-\d{1,2}-\d{1,2}$/), z.date()]).transform((value) => {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  const [y, m, d] = value.split('-')
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
})

const frontmatter = z.strictObject({
  title: z.string().min(1),
  date,
  updated: date.optional(),
  description: z.string().optional(),
  authorName: z.string(),
  authorPosition: z.string(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false)
})

let memo: Post[] | undefined

function loadPosts(): Post[] {
  if (memo) return memo

  const posts = readdirSync(postsDir, { withFileTypes: true })
    .map((entry) => {
      if (entry.isDirectory() && existsSync(join(postsDir, entry.name, 'index.md'))) {
        return { slug: entry.name, file: join(postsDir, entry.name, 'index.md') }
      }
      if (entry.isFile() && entry.name.endsWith('.md')) {
        return { slug: entry.name.slice(0, -3), file: join(postsDir, entry.name) }
      }
    })
    .filter((source) => source !== undefined)
    .map(({ slug, file }) => loadPost(slug, file))
    .filter((post) => post !== undefined)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((post, index, all) => ({
      ...post,
      next: all[index - 1] && { slug: all[index - 1].slug, title: all[index - 1].title },
      previous: all[index + 1] && { slug: all[index + 1].slug, title: all[index + 1].title }
    }))

  // Rebuild on every request in dev so Markdown edits show up; build once otherwise
  if (!isDev) memo = posts
  return posts
}

function loadPost(slug: string, file: string): Post | undefined {
  const { data, content } = matter(readFileSync(file, 'utf8'))
  const parsed = frontmatter.safeParse(data)
  if (!parsed.success) {
    throw new Error(`Invalid front matter in ${file}:\n${z.prettifyError(parsed.error)}`)
  }
  const meta = parsed.data
  if (meta.draft && !isDev) return undefined

  const rendered = renderMarkdown(content, { slug, resolveMedia })
  const stats = readingTime(rendered.text)

  return {
    slug,
    title: meta.title,
    date: meta.date,
    updated: meta.updated,
    description: truncate(meta.description ?? rendered.excerpt.text, 160),
    excerptHtml: rendered.excerpt.html,
    authorName: meta.authorName,
    authorPosition: meta.authorPosition,
    tags: meta.tags,
    readingTime: stats.text,
    wordCount: stats.words,
    headings: rendered.headings,
    hast: rendered.hast
  }
}

const resolveMedia: MediaResolver = (path) => {
  const entry = manifest.files[path]
  if (entry) {
    return {
      url: mediaUrl(entry.key),
      width: entry.width,
      height: entry.height,
      video: isVideo(path),
      poster: entry.poster && mediaUrl(entry.poster.key)
    }
  }

  // A draft's media before `pnpm media:sync`: serve the local file in dev only.
  // Dev-only paths are excluded from output tracing so the build doesn't bundle the repo.
  if (isDev) {
    const local = join(/*turbopackIgnore: true*/ root, path)
    if (existsSync(local)) {
      const target = join(/*turbopackIgnore: true*/ root, 'public', 'media', path)
      mkdirSync(dirname(target), { recursive: true })
      copyFileSync(local, target)
      return { url: `/media/${path}`, video: isVideo(path) }
    }
  }

  throw new Error(`${path} is not in media-manifest.json. Run pnpm media:sync && pnpm media:deploy`)
}

// Trims to at most `max` characters at a word boundary
function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:]+$/, '')}…`
}

function summarize(post: Post): PostSummary {
  const { hast, previous, next, ...summary } = post
  void [hast, previous, next]
  return summary
}

export const getAllPosts = cache((): PostSummary[] => loadPosts().map(summarize))

export const getPost = cache((slug: string): Post | undefined =>
  loadPosts().find((post) => post.slug === slug)
)
