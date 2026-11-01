import Link from 'next/link'
import type { PostSummary } from '@/lib/posts'
import { ArrowRightIcon } from './icons'
import { PostDate } from './PostDate'

export function PostList({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="flex flex-col gap-16">
      {posts.map((post) => (
        <article key={post.slug} className="grid grid-cols-4 items-start gap-8">
          <PostDate post={post} className="hidden flex-col text-sm md:flex" />
          <div className="col-span-4 md:col-span-3">
            <PostPreview post={post} />
          </div>
        </article>
      ))}
    </div>
  )
}

// The whole card is one link; its hover background extends past the text
function PostPreview({ post }: { post: PostSummary }) {
  return (
    <div className="group relative flex flex-col items-start">
      <PostDate post={post} collapsed decorate className="md:hidden" />
      <h2 className="text-base font-semibold tracking-tight text-ink-800 dark:text-ink-100">
        <span className="absolute -inset-x-4 -inset-y-6 z-0 scale-95 bg-ink-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:-inset-x-6 sm:rounded-2xl dark:bg-ink-800/50" />
        <Link href={`/posts/${post.slug}`}>
          <span className="absolute -inset-x-4 -inset-y-6 z-20 sm:-inset-x-6 sm:rounded-2xl" />
          <span className="relative z-10">{post.title}</span>
        </Link>
      </h2>
      <div className="relative z-10 mt-2 flex-1 text-sm text-ink-600 dark:text-ink-400">
        <div
          className="prose dark:prose-invert [&>p]:my-0"
          dangerouslySetInnerHTML={{ __html: post.excerptHtml }}
        />
      </div>
      <div
        aria-hidden="true"
        className="relative z-10 mt-4 flex items-center text-brand-700 dark:text-brand-400"
      >
        <span className="text-sm font-medium">Read</span>
        <ArrowRightIcon className="ml-1 h-4 w-4" />
      </div>
    </div>
  )
}
