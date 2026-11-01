import Link from 'next/link'
import { LogoMark } from './LogoMark'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between py-4 lg:pb-6">
      <Link href="/" aria-label="vynci.dev home">
        <LogoMark width={50} className="text-brand-700 dark:text-brand-400" />
      </Link>
      <nav aria-label="Site" className="flex items-center gap-4">
        <Link
          href="/about"
          className="text-sm font-medium text-ink-700 transition hover:text-brand-700 sm:text-base dark:text-ink-200 dark:hover:text-brand-400"
        >
          About me
        </Link>
        <span className="h-5 w-px bg-ink-200 dark:bg-ink-700" aria-hidden="true" />
        <ThemeToggle />
      </nav>
    </header>
  )
}
