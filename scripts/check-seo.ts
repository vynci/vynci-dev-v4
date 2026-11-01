// SEO smoke test against a running build (default http://localhost:3456, `pnpm start -p 3456`).
// Crawls the sitemap and checks each page's head, structured data and OG image, plus
// robots.txt, the RSS feed and the redirects. Canonical URLs point at www.vynci.dev; they
// are mapped onto the base URL for fetching.
//
// Usage: pnpm seo:check [baseUrl]

import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { url as canonicalOrigin } from '../src/lib/site.ts'

const base = (process.argv[2] ?? 'http://localhost:3456').replace(/\/$/, '')
const local = (url: string) => url.replace(canonicalOrigin, base)

const failures: string[] = []
const fail = (where: string, problem: string) => failures.push(`${where}: ${problem}`)

const meta = (html: string, attr: 'name' | 'property', key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1]

async function checkPage(url: string) {
  const response = await fetch(local(url))
  if (response.status !== 200) return fail(url, `status ${response.status}`)
  const html = await response.text()
  const head = html.slice(0, html.indexOf('</head>'))

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0
  if (h1s !== 1) fail(url, `${h1s} <h1> elements`)

  if (!/<title>[^<]+<\/title>/.test(head)) fail(url, 'missing <title>')

  const description = meta(head, 'name', 'description')
  if (!description) fail(url, 'missing meta description')
  else if (description.length < 50 || description.length > 160) {
    fail(url, `meta description is ${description.length} characters`)
  }

  const canonical = head.match(/<link rel="canonical" href="([^"]*)"/)?.[1]
  if (canonical !== url) fail(url, `canonical is ${canonical}`)
  if (meta(head, 'property', 'og:url') !== url) fail(url, 'og:url differs from the canonical URL')
  if (!head.includes('type="application/rss+xml"')) fail(url, 'missing RSS alternate link')

  const ogImage = meta(head, 'property', 'og:image')
  if (!ogImage) fail(url, 'missing og:image')
  else {
    const image = await fetch(local(ogImage))
    const type = image.headers.get('content-type')
    if (image.status !== 200 || type !== 'image/png') fail(url, `og:image ${image.status} ${type}`)
  }

  const isPost = url.includes('/posts/')
  if (isPost && meta(head, 'property', 'og:type') !== 'article') fail(url, 'og:type is not article')

  const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)]
  if (!blocks.length) fail(url, 'no JSON-LD')
  for (const [, json] of blocks) {
    try {
      const nodes: Record<string, unknown>[] = JSON.parse(json)['@graph'] ?? []
      const posting = nodes.find((node) => node['@type'] === 'BlogPosting')
      if (isPost) {
        if (!posting) fail(url, 'no BlogPosting in JSON-LD')
        else {
          for (const field of ['headline', 'datePublished', 'author', 'image', 'url']) {
            if (!posting[field]) fail(url, `BlogPosting is missing ${field}`)
          }
          const image = await fetch(local(String(posting.image)))
          if (image.status !== 200) fail(url, `BlogPosting image returns ${image.status}`)
        }
      }
    } catch {
      fail(url, 'invalid JSON-LD')
    }
  }

  if (/href="\/post\//.test(html)) fail(url, 'links to /post/')
}

async function checkRedirect(from: string, to: string) {
  const response = await fetch(base + from, { redirect: 'manual' })
  const location = response.headers.get('location')?.replace(base, '')
  if (response.status !== 308 || location !== to) {
    fail(from, `expected 308 to ${to}, got ${response.status} to ${location}`)
  }
}

function checkXml(name: string, xml: string) {
  const file = join(mkdtempSync(join(tmpdir(), 'seo-')), name)
  writeFileSync(file, xml)
  try {
    execFileSync('xmllint', ['--noout', file], { stdio: 'pipe' })
  } catch (error) {
    fail(name, `not well-formed XML: ${(error as { stderr: Buffer }).stderr}`)
  }
}

// Sitemap
const sitemap = await (await fetch(`${base}/sitemap.xml`)).text()
checkXml('sitemap.xml', sitemap)
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
for (const url of urls) {
  if (url !== canonicalOrigin && !url.startsWith(`${canonicalOrigin}/`)) {
    fail('sitemap.xml', `non-canonical URL ${url}`)
  }
}
await Promise.all(urls.map(checkPage))

// robots.txt
const robots = await (await fetch(`${base}/robots.txt`)).text()
if (!robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`)) {
  fail('robots.txt', 'missing Sitemap line')
}

// RSS
const rss = await fetch(`${base}/rss.xml`)
if (!rss.headers.get('content-type')?.startsWith('application/rss+xml')) {
  fail('rss.xml', `content-type ${rss.headers.get('content-type')}`)
}
const feed = await rss.text()
checkXml('rss.xml', feed)
const items = feed.match(/<item>/g)?.length ?? 0
const posts = urls.filter((url) => url.includes('/posts/')).length
if (items !== posts) fail('rss.xml', `${items} items for ${posts} posts`)
if (/(href|src)="\//.test(feed)) fail('rss.xml', 'relative URL in content')

// Redirects
await checkRedirect(
  '/post/robot-control-using-aws-iot-core',
  '/posts/robot-control-using-aws-iot-core'
)
await checkRedirect('/posts', '/')

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(
  `seo:check: ${urls.length} pages, robots.txt, rss.xml (${items} items) and redirects OK`
)
