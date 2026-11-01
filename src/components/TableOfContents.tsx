'use client'

import clsx from 'clsx'
import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/markdown'

// Highlights the section being read: the last heading scrolled past, or the last
// heading once the reader is near the end of the page.
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | undefined>(headings[0]?.id)

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element) => element !== null)

    let frame = 0
    function update() {
      frame = 0
      const offset = window.scrollY + 80
      let current = elements[0]
      for (const element of elements) {
        if (element.offsetTop <= offset) current = element
      }
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4
      setActive((atBottom ? elements.at(-1) : current)?.id)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [headings])

  return (
    <nav aria-label="Table of contents" className="text-sm">
      <ul className="flex flex-col gap-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={clsx(
              'border-brand-600 transition-colors dark:border-brand-400',
              heading.depth === 3 ? 'pl-[0.7rem]' : 'pl-[0.35rem]',
              active === heading.id
                ? '-ml-0.5 border-l-2 font-medium text-ink-900 dark:text-ink-100'
                : 'text-ink-500 hover:text-ink-900 dark:text-ink-400 dark:hover:text-ink-100'
            )}
          >
            <a href={`#${heading.id}`}>{heading.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
