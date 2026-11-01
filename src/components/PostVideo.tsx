'use client'

import { useEffect, useRef, useState, type ComponentProps } from 'react'

// Short silent clips that autoplay like GIFs. Nothing downloads until the video scrolls
// into view, and it pauses when it leaves. With reduced motion, it shows controls instead.
export function PostVideo({ src, poster, width, height, ...rest }: ComponentProps<'video'>) {
  const ref = useRef<HTMLVideoElement>(null)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const video = ref.current
    if (!video) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReducedMotion(reduce)
    if (reduce) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      width={width}
      height={height}
      aria-label={rest['aria-label']}
      muted
      loop
      playsInline
      preload="none"
      controls={reducedMotion}
    />
  )
}
