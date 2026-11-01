import { Footer } from '@/components/Footer'
import { PostList } from '@/components/PostList'
import { WhoAmI } from '@/components/WhoAmI'
import { getAllPosts } from '@/lib/posts'
import * as site from '@/lib/site'

export default function Home() {
  return (
    <div className="mt-6 flex grow flex-col gap-8 pb-2">
      <section className="w-full">
        <h1 className="sr-only">{site.name}: software and hardware engineering notes</h1>
        <WhoAmI />
        <PostList posts={getAllPosts()} />
      </section>
      <Footer />
    </div>
  )
}
