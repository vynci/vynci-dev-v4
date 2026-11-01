// Post media (images, videos, posters) lives in S3 behind CloudFront, not in git.
// scripts/media-sync.ts writes media-manifest.json; the site reads only the manifest.
// See plans/vynci-dev-to-nextjs/PLAN.md, section 7a.

// TODO: switch to https://media.vynci.dev once its certificate is issued and attached
export const mediaOrigin = 'https://d203yvyxkx65mq.cloudfront.net'

export const imageTypes: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml'
}

export const videoTypes: Record<string, string> = {
  mp4: 'video/mp4',
  webm: 'video/webm'
}

export interface MediaVariant {
  key: string
  bytes: number
  contentType: string
  width: number
  height: number
}

export interface MediaEntry extends MediaVariant {
  sha256: string
  // First frame of a video, shown until it plays
  poster?: MediaVariant
}

export interface MediaManifest {
  version: 1
  // Keyed by source path relative to the repo root, e.g. posts/<slug>/overview.png
  files: Record<string, MediaEntry>
}

export function extensionOf(path: string): string {
  return path.slice(path.lastIndexOf('.') + 1).toLowerCase()
}

export function isVideo(path: string): boolean {
  return extensionOf(path) in videoTypes
}

export function mediaUrl(key: string): string {
  return `${mediaOrigin}/${key}`
}
