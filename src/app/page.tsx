import Link from 'next/link'
import { getAllPosts } from '@/lib/posts'

// Placeholder until P2 ports the post list
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold">vynci.dev</h1>
      <p className="mt-4">Next.js rebuild in progress.</p>
      <ul className="mt-8 flex flex-col gap-4">
        {getAllPosts().map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`} className="font-semibold text-teal-600">
              {post.title}
            </Link>
            <div className="text-sm">
              {post.date} · {post.readingTime}
            </div>
          </li>
        ))}
      </ul>
    </main>
  )
}
