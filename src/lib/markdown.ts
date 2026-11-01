// Markdown → hast pipeline for posts. Pure and synchronous: no file system access,
// media is resolved through the `resolveMedia` callback.

import type { Element, ElementContent, Root } from 'hast'
import { toHtml } from 'hast-util-to-html'
import { toString } from 'hast-util-to-string'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrism from 'rehype-prism-plus'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkSmartypants from 'remark-smartypants'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export interface ResolvedMedia {
  url: string
  // Unknown only for unsynced files served locally in `next dev`
  width?: number
  height?: number
  video?: boolean
  poster?: string
}

// `path` is relative to the repo root, e.g. posts/<slug>/overview.png
export type MediaResolver = (path: string) => ResolvedMedia

export interface Heading {
  depth: 2 | 3
  id: string
  text: string
}

export interface RenderedMarkdown {
  hast: Root
  headings: Heading[]
  // First paragraph, for post cards (HTML) and meta descriptions (text)
  excerpt: { html: string; text: string }
  // All rendered text, for reading time
  text: string
}

export function renderMarkdown(
  markdown: string,
  options: { slug: string; resolveMedia: MediaResolver }
): RenderedMarkdown {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSmartypants, { dashes: 'oldschool' })
    .use(rejectRawHtml)
    .use(remarkRehype)
    .use(postMedia, options)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrism, { ignoreMissing: true })

  const hast = processor.runSync(processor.parse(markdown)) as Root

  return {
    hast,
    headings: extractHeadings(hast),
    excerpt: extractExcerpt(hast),
    text: toString(hast)
  }
}

// Posts are plain Markdown; raw HTML would be dropped silently by remark-rehype.
function rejectRawHtml() {
  return (tree: import('mdast').Root) => {
    visit(tree, 'html', (node) => {
      throw new Error(
        `Raw HTML is not supported (line ${node.position?.start.line}): ${node.value}`
      )
    })
  }
}

// Relative image paths become CDN URLs with intrinsic sizes. Image syntax pointing at a
// video file (`![alt](./clip.mp4)`) becomes a <video>, as on the SvelteKit site.
function postMedia(options: { slug: string; resolveMedia: MediaResolver }) {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'img') return
      const src = String(node.properties.src ?? '')
      if (/^([a-z]+:|\/)/i.test(src)) return

      const path = `posts/${options.slug}/${src.replace(/^\.\//, '')}`
      const media = options.resolveMedia(decodeURI(path))
      const alt = String(node.properties.alt ?? '')

      if (media.video) {
        node.tagName = 'video'
        node.properties = {
          src: media.url,
          poster: media.poster,
          width: media.width,
          height: media.height,
          ariaLabel: alt || undefined
        }
      } else {
        node.properties = {
          ...node.properties,
          src: media.url,
          width: media.width,
          height: media.height
        }
      }
    })
  }
}

function extractHeadings(hast: Root): Heading[] {
  const headings: Heading[] = []
  visit(hast, 'element', (node) => {
    if (node.tagName !== 'h2' && node.tagName !== 'h3') return
    headings.push({
      depth: node.tagName === 'h2' ? 2 : 3,
      id: String(node.properties.id),
      text: toString(node)
    })
  })
  return headings
}

function extractExcerpt(hast: Root): RenderedMarkdown['excerpt'] {
  const paragraph = hast.children.find(
    (node): node is Element =>
      node.type === 'element' && node.tagName === 'p' && toString(node).trim() !== ''
  )
  if (!paragraph) return { html: '', text: '' }

  // The post card is itself a link: unwrap nested links and drop media
  const clean = (nodes: ElementContent[]): ElementContent[] =>
    nodes.flatMap((node) => {
      if (node.type !== 'element') return [node]
      if (node.tagName === 'a') return clean(node.children)
      if (node.tagName === 'img' || node.tagName === 'video') return []
      return [{ ...node, children: clean(node.children) }]
    })
  const excerpt: Element = { ...paragraph, children: clean(paragraph.children) }

  return { html: toHtml(excerpt), text: toString(excerpt).replace(/\s+/g, ' ').trim() }
}
