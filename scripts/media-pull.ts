// Restores the original media files into posts/ from the CDN, using media-manifest.json.
// For a fresh clone: binaries are not in git.
//
// Usage: pnpm media:pull

import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { mediaUrl, type MediaManifest } from '../src/lib/media.ts'

const root = join(import.meta.dirname, '..')
const manifest: MediaManifest = JSON.parse(
  await readFile(join(root, 'media-manifest.json'), 'utf8')
)

let pulled = 0
for (const [source, entry] of Object.entries(manifest.files)) {
  const target = join(root, source)
  if (existsSync(target)) continue

  const response = await fetch(mediaUrl(entry.key))
  if (!response.ok) throw new Error(`${response.status} for ${entry.key}`)
  const body = Buffer.from(await response.arrayBuffer())

  const sha256 = createHash('sha256').update(body).digest('hex')
  if (sha256 !== entry.sha256) throw new Error(`Checksum mismatch for ${source}`)

  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, body)
  pulled++
}

console.log(`media:pull: ${pulled} file(s) downloaded`)
