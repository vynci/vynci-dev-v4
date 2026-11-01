import { ImageResponse } from 'next/og'
import { LogoMark } from '@/components/LogoMark'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// iOS home screen icon: opaque background with padding, as iOS expects
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff'
      }}
    >
      <LogoMark width={132} />
    </div>,
    size
  )
}
