import Link from 'next/link'
import * as site from '@/lib/site'
import { SocialLinks } from './SocialLinks'

// Inlined by next.config.ts at build time. Reading the clock while rendering fails the
// prerender under Cache Components, and a cached value would make pages revalidate.
const year = process.env.BUILD_YEAR

export function Footer({ href = '/about' }: { href?: string }) {
  return (
    <footer className="mt-8">
      <hr />
      <div className="grid gap-8 py-8">
        <div className="flex justify-center gap-6">
          <SocialLinks />
        </div>
        <div className="flex justify-center text-center text-sm text-zinc-400">
          <Link href={href}>
            © Copyright {year} {site.name}
          </Link>
        </div>
      </div>
    </footer>
  )
}
