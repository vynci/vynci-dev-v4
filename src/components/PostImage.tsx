import Image from 'next/image'
import type { ComponentProps } from 'react'

type Props = ComponentProps<'img'> & {
  // The likely LCP element: load it right away
  eager?: boolean
}

export function PostImage({ src, alt = '', width, height, eager }: Props) {
  if (typeof src !== 'string') return null

  // Unsynced media in `next dev` has no known size: render it as-is
  if (!width || !height) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} />
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={Number(width)}
      height={Number(height)}
      sizes="(min-width: 768px) 42rem, 100vw"
      {...(eager ? { loading: 'eager', fetchPriority: 'high' } : {})}
    />
  )
}
