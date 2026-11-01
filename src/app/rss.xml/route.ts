import type { Root } from 'hast'
import { toHtml } from 'hast-util-to-html'
import { visit } from 'unist-util-visit'
import { getAllPosts, getPost } from '@/lib/posts'
import { absoluteUrl, postPath } from '@/lib/seo'
import * as site from '@/lib/site'

// RSS 2.0 with full post content. Same URL as the SvelteKit site, so subscribers keep working.
// Reads posts synchronously, so it is prerendered at build time like the pages.
export function GET() {
  const posts = getAllPosts()

  const items = posts.map((summary) => {
    const post = getPost(summary.slug)!
    const url = absoluteUrl(postPath(post.slug))
    return `
    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
      <dc:creator>${escape(site.name)}</dc:creator>
      <description>${escape(post.description)}</description>
      <content:encoded>${cdata(feedHtml(post.hast, url))}</content:encoded>
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(site.title)}</title>
    <link>${absoluteUrl('/')}</link>
    <description>${escape(site.description)}</description>
    <language>en</language>
    <lastBuildDate>${new Date(`${posts[0]?.date}T00:00:00Z`).toUTCString()}</lastBuildDate>
    <atom:link href="${absoluteUrl('/rss.xml')}" rel="self" type="application/rss+xml" />${items.join('')}
  </channel>
</rss>
`

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}

// Feed readers show content out of context: make every link and anchor absolute
function feedHtml(hast: Root, postUrl: string) {
  const tree = structuredClone(hast)
  visit(tree, 'element', (node) => {
    for (const attribute of ['href', 'src', 'poster'] as const) {
      const value = node.properties[attribute]
      if (typeof value !== 'string') continue
      if (value.startsWith('#')) node.properties[attribute] = postUrl + value
      else if (value.startsWith('/')) node.properties[attribute] = absoluteUrl(value)
    }
  })
  return toHtml(tree)
}

function escape(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function cdata(text: string) {
  return `<![CDATA[${text.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`
}
