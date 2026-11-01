'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type MouseEvent } from 'react'
import { ArrowLeftIcon } from './icons'

// True once the visitor has navigated within the site in this tab, so going "back"
// returns to where they came from (keeping list scroll position) instead of the home page.
let navigatedInApp = false
let firstPath: string | undefined

// Rendered once in the root layout
export function NavigationTracker() {
  const pathname = usePathname()
  useEffect(() => {
    if (firstPath === undefined) firstPath = pathname
    else if (pathname !== firstPath) navigatedInApp = true
  }, [pathname])
  return null
}

export function BackButton() {
  const router = useRouter()

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (navigatedInApp) {
      event.preventDefault()
      router.back()
    }
  }

  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Go back to posts"
      className="group flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-ink-800/5 ring-ink-900/5 transition dark:border dark:border-ink-700/50 dark:bg-ink-800 dark:ring-0 dark:ring-white/10 dark:hover:border-ink-700 dark:hover:ring-white/20 dark:focus-visible:ring-2"
    >
      <ArrowLeftIcon className="h-4 w-4 fill-ink-500 transition group-hover:fill-ink-700 dark:fill-ink-500 dark:group-hover:fill-ink-400" />
    </Link>
  )
}
