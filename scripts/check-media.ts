// Verifies every file in media-manifest.json is served by the CDN with the right
// type, size and immutable caching, and that videos support range requests.
//
// Usage: pnpm media:check

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { mediaUrl, type MediaManifest, type MediaVariant } from '../src/lib/media.ts'

const root = join(import.meta.dirname, '..')
const manifest: MediaManifest = JSON.parse(
  await readFile(join(root, 'media-manifest.json'), 'utf8')
)

const variants: MediaVariant[] = Object.values(manifest.files).flatMap((entry) =>
  entry.poster ? [entry, entry.poster] : [entry]
)

const failures: string[] = []
await Promise.all(
  variants.map(async ({ key, bytes, contentType }) => {
    const response = await fetch(mediaUrl(key), { method: 'HEAD' })
    const problems = [
      response.status !== 200 && `status ${response.status}`,
      response.headers.get('content-type') !== contentType &&
        `content-type ${response.headers.get('content-type')}`,
      Number(response.headers.get('content-length')) !== bytes &&
        `content-length ${response.headers.get('content-length')} != ${bytes}`,
      !response.headers.get('cache-control')?.includes('immutable') &&
        `cache-control ${response.headers.get('cache-control')}`
    ].filter(Boolean)
    if (problems.length) failures.push(`${key}: ${problems.join(', ')}`)
  })
)

const video = variants.find((variant) => variant.contentType.startsWith('video/'))
if (video) {
  const response = await fetch(mediaUrl(video.key), { headers: { Range: 'bytes=0-1023' } })
  await response.arrayBuffer()
  if (response.status !== 206)
    failures.push(`${video.key}: range request returned ${response.status}`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}
console.log(`media:check: ${variants.length} files OK, range requests OK`)
