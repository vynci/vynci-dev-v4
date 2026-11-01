import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PostBody } from '@/components/PostBody'
import { getAllPosts, getPost } from '@/lib/posts'

// Bare post page for P1; P2 ports the full layout (back button, author, ToC)

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  return { title: post.title, description: post.description }
}

export default async function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  const post = getPost((await params).slug)
  if (!post) notFound()

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
        {post.title}
      </h1>
      <p className="mt-4 text-sm">
        <time dateTime={post.date}>{post.date}</time> · {post.readingTime}
      </p>
      <div className="prose dark:prose-invert">
        <PostBody hast={post.hast} />
      </div>
    </article>
  )
}
