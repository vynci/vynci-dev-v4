'use client'

import { MoonIcon, SunIcon } from '@heroicons/react/20/solid'
import { useSyncExternalStore } from 'react'

// Reads the `dark` class the inline theme script (layout.tsx) sets before first paint,
// and stays in sync when that script reacts to OS or other-tab changes.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const isDark = () => document.documentElement.classList.contains('dark')

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => true)

  function toggle() {
    const next = !dark
    try {
      localStorage.setItem('isDarkMode', String(next))
    } catch {}
    const root = document.documentElement
    root.classList.add('no-transitions')
    root.classList.toggle('dark', next)
    setTimeout(() => root.classList.remove('no-transitions'), 0)
  }

  return (
    <button
      type="button"
      role="switch"
      aria-label="Toggle dark mode"
      aria-checked={dark}
      className="h-5 w-5 sm:h-8 sm:w-8 sm:p-1"
      onClick={toggle}
    >
      <MoonIcon className="hidden text-ink-500 dark:block" />
      <SunIcon className="block text-ink-400 dark:hidden" />
    </button>
  )
}
