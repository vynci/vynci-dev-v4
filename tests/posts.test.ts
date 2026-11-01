// Parity with the SvelteKit site. tests/fixtures/production.json was captured from
// https://www.vynci.dev on 2026-11-01 (heading ids, dates, reading times, text).

import type { Root } from 'hast'
import readingTime from 'reading-time'
import { visit } from 'unist-util-visit'
import { describe, expect, it } from 'vitest'
import { renderMarkdown } from '@/lib/markdown'
import { mediaOrigin } from '@/lib/media'
import { getAllPosts, getPost } from '@/lib/posts'
import production from './fixtures/production.json'

const fixtures = production as Record<
  string,
  {
    headings: { depth: number; id: string }[]
    readingTime: string
    date: string
    description: string
    text: string
  }
>

const posts = getAllPosts()

function headingIds(hast: Root) {
  const ids: { depth: number; id: string }[] = []
  visit(hast, 'element', (node) => {
    const match = /^h([1-6])$/.exec(node.tagName)
    if (match && node.properties.id)
      ids.push({ depth: Number(match[1]), id: String(node.properties.id) })
  })
  return ids
}

describe('posts', () => {
  it('loads every post with the same slugs as production, newest first', () => {
    expect(posts.map((post) => post.slug).sort()).toEqual(Object.keys(fixtures).sort())
    const dates = posts.map((post) => post.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('links previous and next posts in date order', () => {
    const [newest, second] = posts
    expect(getPost(newest.slug)?.next).toBeUndefined()
    expect(getPost(newest.slug)?.previous?.slug).toBe(second.slug)
    expect(getPost(second.slug)?.next?.slug).toBe(newest.slug)
  })

  it('returns undefined for an unknown slug', () => {
    expect(getPost('does-not-exist')).toBeUndefined()
  })

  describe.each(Object.keys(fixtures))('%s', (slug) => {
    const fixture = fixtures[slug]
    const post = getPost(slug)!

    it('normalizes the date to YYYY-MM-DD', () => {
      expect(post.date).toBe(fixture.date)
    })

    it('renders the same heading ids as production', () => {
      expect(headingIds(post.hast)).toEqual(fixture.headings)
    })

    it('lists ToC headings that exist in the rendered tree', () => {
      const ids = new Set(headingIds(post.hast).map((heading) => heading.id))
      expect(post.headings.length).toBeGreaterThan(0)
      for (const heading of post.headings) expect(ids).toContain(heading.id)
    })

    it('serves every image and video from the CDN with known dimensions', () => {
      let count = 0
      visit(post.hast, 'element', (node) => {
        if (node.tagName !== 'img' && node.tagName !== 'video') return
        count++
        expect(String(node.properties.src)).toMatch(new RegExp(`^${mediaOrigin}/posts/${slug}/`))
        expect(node.properties.width).toBeGreaterThan(0)
        expect(node.properties.height).toBeGreaterThan(0)
        if (node.tagName === 'video') expect(String(node.properties.poster)).toMatch(/\.poster\./)
      })
      expect(count).toBeGreaterThan(0)
    })

    // Production's displayed reading times are inflated (the old pipeline counted each
    // highlighted code token as a word). Its visible text has the same word count as ours.
    it('has the same word count as the production text', () => {
      const words = readingTime(fixture.text).words
      expect(Math.abs(post.wordCount - words)).toBeLessThanOrEqual(2)
    })

    it('uses the first paragraph as the description', () => {
      expect(post.description.length).toBeLessThanOrEqual(160)
      const start = post.description.replace(/…$/, '').slice(0, 80)
      expect(fixture.description.startsWith(start)).toBe(true)
    })

    it('applies the same smart punctuation as production', () => {
      const count = (text: string) =>
        Object.fromEntries(
          ['‘', '’', '“', '”', '–', '—', '…'].map((c) => [c, text.split(c).length - 1])
        )
      let text = ''
      visit(post.hast, 'text', (node) => {
        text += node.value
      })
      expect(count(text)).toEqual(count(fixture.text))
    })
  })
})

describe('renderMarkdown', () => {
  const resolveMedia = (path: string) => ({ url: `https://cdn.test/${path}`, width: 10, height: 5 })

  it('rejects raw HTML', () => {
    expect(() => renderMarkdown('Hello <b>there</b>', { slug: 'x', resolveMedia })).toThrow(
      /Raw HTML/
    )
  })

  it('turns image syntax pointing at a video into a video element', () => {
    const { hast } = renderMarkdown('![Demo clip](./clip.mp4)', {
      slug: 'x',
      resolveMedia: (path) => ({ ...resolveMedia(path), video: true, poster: 'p.jpg' })
    })
    let video: Record<string, unknown> | undefined
    visit(hast, 'element', (node) => {
      if (node.tagName === 'video') video = node.properties
    })
    expect(video).toMatchObject({
      src: 'https://cdn.test/posts/x/clip.mp4',
      poster: 'p.jpg',
      ariaLabel: 'Demo clip'
    })
  })

  it('unwraps links and drops media in the excerpt', () => {
    const { excerpt } = renderMarkdown('![x](./a.png)\n\nSee [the repo](https://github.com) now.', {
      slug: 'x',
      resolveMedia
    })
    expect(excerpt).toEqual({ html: '<p>See the repo now.</p>', text: 'See the repo now.' })
  })
})
