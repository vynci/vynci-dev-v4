// Hashes and measures every image and video next to the posts, makes video posters,
// stages content-addressed copies in .media-out/stage for `pnpm media:deploy`, and
// updates media-manifest.json. Entries whose local file is missing (a fresh clone
// without `pnpm media:pull`) are kept as they are.
//
// Usage: pnpm media:sync

import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { imageSizeFromFile } from 'image-size/fromFile'
import {
  extensionOf,
  imageTypes,
  isVideo,
  videoTypes,
  type MediaEntry,
  type MediaManifest,
  type MediaVariant
} from '../src/lib/media.ts'

const root = join(import.meta.dirname, '..')
const manifestPath = join(root, 'media-manifest.json')
const stageDir = join(root, '.media-out', 'stage')
const posterCache = join(root, '.media-out', 'cache', 'posters')

const contentTypes = { ...imageTypes, ...videoTypes }

async function main() {
  const manifest = await readManifest()
  const sources = await findMediaFiles()

  await rm(stageDir, { recursive: true, force: true })
  await mkdir(posterCache, { recursive: true })

  const counts = { added: 0, changed: 0, unchanged: 0 }
  for (const source of sources) {
    const absolute = join(root, source)
    const sha256 = await hashFile(absolute)
    const previous = manifest.files[source]

    let entry: MediaEntry
    if (previous?.sha256 === sha256) {
      entry = previous
      counts.unchanged++
    } else {
      entry = await describe(source, absolute, sha256)
      counts[previous ? 'changed' : 'added']++
    }

    await stage(absolute, entry.key)
    if (isVideo(source)) {
      entry.poster = await stagePoster(absolute, source, sha256, entry.poster)
    }
    manifest.files[source] = entry
  }

  const missing = Object.keys(manifest.files).filter((source) => !sources.includes(source))
  await writeManifest(manifest)

  console.log(
    `media:sync: ${counts.added} added, ${counts.changed} changed, ${counts.unchanged} unchanged` +
      (missing.length ? `, ${missing.length} in manifest but not on disk (kept)` : '')
  )
  console.log(`Staged in ${stageDir}. Next: pnpm media:deploy`)
}

async function readManifest(): Promise<MediaManifest> {
  if (!existsSync(manifestPath)) return { version: 1, files: {} }
  return JSON.parse(await readFile(manifestPath, 'utf8'))
}

async function writeManifest(manifest: MediaManifest) {
  const files = Object.fromEntries(
    Object.entries(manifest.files).sort(([a], [b]) => a.localeCompare(b))
  )
  await writeFile(manifestPath, JSON.stringify({ version: 1, files }, null, 2) + '\n')
}

async function findMediaFiles(): Promise<string[]> {
  const entries = await readdir(join(root, 'posts'), { recursive: true, withFileTypes: true })
  return entries
    .filter((entry) => entry.isFile() && extensionOf(entry.name) in contentTypes)
    .map((entry) => join(entry.parentPath, entry.name).slice(root.length + 1))
    .sort()
}

async function hashFile(path: string): Promise<string> {
  return createHash('sha256')
    .update(await readFile(path))
    .digest('hex')
}

function keyFor(source: string, sha256: string, suffix = ''): string {
  const ext = extensionOf(source)
  const name = basename(source, `.${ext}`)
  return `${dirname(source)}/${name}${suffix}.${sha256.slice(0, 10)}.${ext}`
}

async function describe(source: string, absolute: string, sha256: string): Promise<MediaEntry> {
  const { width, height } = isVideo(source) ? probeVideo(absolute) : await measureImage(absolute)
  return {
    key: keyFor(source, sha256),
    sha256,
    bytes: (await stat(absolute)).size,
    contentType: contentTypes[extensionOf(source)],
    width,
    height
  }
}

async function measureImage(path: string) {
  const { width, height, orientation } = await imageSizeFromFile(path)
  // EXIF orientations 5-8 are rotated 90 degrees: the displayed size is swapped
  return orientation && orientation >= 5 ? { width: height, height: width } : { width, height }
}

function probeVideo(path: string) {
  const output = execFileSync('ffprobe', [
    '-v',
    'error',
    '-select_streams',
    'v:0',
    '-show_entries',
    'stream=width,height',
    '-of',
    'json',
    path
  ])
  const [stream] = JSON.parse(output.toString()).streams
  return { width: stream.width as number, height: stream.height as number }
}

async function stage(absolute: string, key: string) {
  const target = join(stageDir, key)
  await mkdir(dirname(target), { recursive: true })
  await copyFile(absolute, target)
}

// Posters are cached by video hash: ffmpeg output is not byte-for-byte reproducible,
// so regenerating would change the poster key on every sync.
async function stagePoster(
  absolute: string,
  source: string,
  sha256: string,
  previous: MediaVariant | undefined
): Promise<MediaVariant | undefined> {
  const cached = join(posterCache, `${sha256}.jpg`)
  if (!existsSync(cached)) {
    if (previous) return previous // already uploaded from another machine
    execFileSync('ffmpeg', ['-v', 'error', '-i', absolute, '-frames:v', '1', '-q:v', '3', cached])
  }
  const posterSha = await hashFile(cached)
  const key = keyFor(source.replace(/\.\w+$/, '.jpg'), posterSha, '.poster')
  await stage(cached, key)
  const { width, height } = await measureImage(cached)
  return { key, bytes: (await stat(cached)).size, contentType: 'image/jpeg', width, height }
}

await main()
