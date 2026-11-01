import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import { Footer } from '@/components/Footer'
import { PostBody } from '@/components/PostBody'
import { PostDate } from '@/components/PostDate'
import { TableOfContents } from '@/components/TableOfContents'
import { JsonLd } from '@/components/JsonLd'
import { getAllPosts, getPost } from '@/lib/posts'
import { postJsonLd, postMetadata } from '@/lib/seo'
import * as site from '@/lib/site'

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: PageProps<'/posts/[slug]'>): Promise<Metadata> {
  const post = getPost((await params).slug)
  return post ? postMetadata(post) : {}
}

// Three columns on large screens: back button | article (42rem) | table of contents
export default async function PostPage({ params }: PageProps<'/posts/[slug]'>) {
  const post = getPost((await params).slug)
  if (!post) notFound()

  return (
    <div className="mx-auto mt-6 grid w-full max-w-2xl grid-cols-1 lg:max-w-none lg:grid-cols-[1fr_42rem_1fr]">
      <JsonLd data={postJsonLd(post)} />
      <div className="hidden pt-8 lg:block">
        <div className="sticky top-0 flex w-full justify-end pt-11 pr-8">
          <BackButton />
        </div>
      </div>

      <div className="mx-auto w-full overflow-x-hidden">
        <article>
          <header className="flex flex-col">
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
              {post.title}
            </h1>
            <Link href="/about" className="mt-8 flex w-fit">
              <Image
                src={site.avatar}
                alt={site.name}
                width={44}
                height={44}
                className="mr-4 h-11 w-11 rounded-full"
              />
              <span className="grid pt-1 text-sm leading-4">
                <span className="font-medium text-zinc-500 dark:text-zinc-400">
                  {post.authorName}
                </span>
                <span className="text-zinc-400 dark:text-zinc-500">{post.authorPosition}</span>
              </span>
            </Link>
            <PostDate post={post} decorate collapsed className="text-sm sm:text-base" />
          </header>

          <div className="prose dark:prose-invert">
            <PostBody hast={post.hast} />
          </div>
        </article>

        <Footer />
      </div>

      <div className="hidden pt-10 xl:block">
        <aside className="sticky top-8 ml-8 w-48">
          <TableOfContents headings={post.headings} />
        </aside>
      </div>
    </div>
  )
}
