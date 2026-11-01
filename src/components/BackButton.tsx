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
      className="group flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20 dark:focus-visible:ring-2"
    >
      <ArrowLeftIcon className="h-4 w-4 fill-zinc-500 transition group-hover:fill-zinc-700 dark:fill-zinc-500 dark:group-hover:fill-zinc-400" />
    </Link>
  )
}
