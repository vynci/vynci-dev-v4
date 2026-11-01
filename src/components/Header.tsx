import Link from 'next/link'
import { LogoMark } from './LogoMark'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between py-4 lg:pb-6">
      <Link href="/" aria-label="vynci.dev home">
        <LogoMark width={58} className="text-brand-700 dark:text-brand-400" />
      </Link>
      <ThemeToggle />
    </header>
  )
}
