import { ImageResponse } from 'next/og'
import { LogoMark } from '@/components/LogoMark'
import { brand } from '@/lib/palette'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

// Browser tab icon, generated at build time from the logo
export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <LogoMark width={64} color={brand[600]} />
    </div>,
    size
  )
}
