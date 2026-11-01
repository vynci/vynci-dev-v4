import Link from 'next/link'

// The `$ whoami` prompt with a blinking cursor, linking to the about page
export function WhoAmI() {
  return (
    <div className="mb-8 flex items-center justify-between gap-4 border-b border-zinc-100 pb-6 dark:border-zinc-800">
      <p className="rounded-md bg-zinc-400 px-2 text-sm font-medium text-gray-100 sm:text-base dark:bg-zinc-500">
        <Link href="/about">
          $ <span>whoami</span>{' '}
          <span className="blink bg-gray-100 dark:bg-gray-200" aria-hidden="true">
            ..
          </span>
        </Link>
      </p>
    </div>
  )
}
