// Shared 1200×630 Open Graph card, generated at build time with next/og.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'

export const ogSize = { width: 1200, height: 630 }
export const ogContentType = 'image/png'

// Local assets are the same for every image: read once at module scope
const fontDir = join(process.cwd(), 'src', 'assets', 'fonts')
const fonts = [
  { name: 'Inter', weight: 400 as const, file: 'inter-latin-400-normal.woff' },
  { name: 'Inter', weight: 700 as const, file: 'inter-latin-700-normal.woff' }
].map(({ name, weight, file }) => ({
  name,
  weight,
  style: 'normal' as const,
  data: readFileSync(join(fontDir, file))
}))

const teal = '#14b8a6'

export function ogImage({ title, footer }: { title: string; footer: string }) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        background: '#18181b',
        fontFamily: 'Inter'
      }}
    >
      <svg viewBox="65 194.98 72.95 80.04" width="72" height="79">
        <path
          fill={teal}
          fillRule="evenodd"
          d="M113.28181,194.98158l-9.44388,37.42136h34.116l-49.4623,42.61549l9.44388,-37.89355h-32.93551zM104.90037,208.4391l-27.38724,23.96384h21.36677zM125.2047,237.12487h-22.54725l-6.02047,24.67213z"
        />
      </svg>
      <div
        style={{
          display: 'flex',
          fontSize: title.length > 60 ? 56 : 64,
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.02em',
          color: '#f4f4f5'
        }}
      >
        {title}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28 }}>
        <span style={{ color: teal, fontWeight: 700 }}>vynci.dev</span>
        <span style={{ color: '#a1a1aa' }}>{footer}</span>
      </div>
    </div>,
    { ...ogSize, fonts }
  )
}
