import { notFound } from 'next/navigation'
import { formatDate } from '@/components/PostDate'
import { ogContentType, ogImage, ogSize } from '@/lib/og'
import { getAllPosts, getPost } from '@/lib/posts'

export const size = ogSize
export const contentType = ogContentType

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)
  if (!post) notFound()
  return ogImage({ title: post.title, footer: `${formatDate(post.date)} · ${post.readingTime}` })
}
