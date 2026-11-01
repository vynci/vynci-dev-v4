import Link from 'next/link'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between py-4 lg:pb-6">
      <Link href="/" aria-label="vynci.dev home">
        <Logo />
      </Link>
      <ThemeToggle />
    </header>
  )
}
