import type { Metadata } from 'next'
import * as site from '@/lib/site'
import './globals.css'

// Every route must be fully prerendered at build time; the build fails otherwise.
export const ensureStatic = 'navigation'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: `%s | ${site.name}` },
  description: site.description
}

// Runs before first paint. Same behavior and localStorage key (`isDarkMode`) as the
// SvelteKit site: follow the OS setting unless the visitor picked the other theme.
const themeScript = `(function () {
  var media = window.matchMedia('(prefers-color-scheme: dark)')
  function update() {
    try {
      var system = media.matches
      var stored = window.localStorage.isDarkMode
      var dark = stored === 'true' || (stored === undefined && system)
      document.documentElement.classList.toggle('dark', dark)
      if (stored !== undefined && dark === system) delete window.localStorage.isDarkMode
    } catch (e) {}
  }
  function updateWithoutTransitions() {
    document.documentElement.classList.add('no-transitions')
    update()
    setTimeout(function () {
      document.documentElement.classList.remove('no-transitions')
    }, 0)
  }
  update()
  media.addEventListener('change', updateWithoutTransitions)
  window.addEventListener('storage', updateWithoutTransitions)
})()`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className="dark relative h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full bg-white text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
        {children}
      </body>
    </html>
  )
}
