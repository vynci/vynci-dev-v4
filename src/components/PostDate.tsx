import clsx from 'clsx'
import type { PostSummary } from '@/lib/posts'

const formatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC'
})

// Dates are calendar dates (YYYY-MM-DD): format them in UTC so no timezone shifts the day
export function formatDate(date: string) {
  return formatter.format(new Date(`${date}T00:00:00Z`))
}

export function PostDate({
  post,
  decorate = false,
  collapsed = false,
  className
}: {
  post: Pick<PostSummary, 'date' | 'readingTime'>
  decorate?: boolean
  collapsed?: boolean
  className?: string
}) {
  return (
    <div
      className={clsx(
        'relative z-10 order-first mb-3 flex text-zinc-500 dark:text-zinc-400',
        decorate && 'pl-3.5',
        className
      )}
    >
      {decorate && (
        <span className="absolute inset-y-0 left-0 flex items-center py-1" aria-hidden="true">
          <span className="h-full w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
        </span>
      )}
      <div className={clsx('flex', !collapsed && 'flex-col')}>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {collapsed && <span className="mx-1">•</span>}
        <span>{post.readingTime}</span>
      </div>
    </div>
  )
}
