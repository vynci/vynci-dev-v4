<script>
  import ArrowRightIcon from '$lib/components/ArrowRightIcon.svelte'
  import PostsList from '$lib/components/PostsList.svelte'
  import SocialLinks from '$lib/components/SocialLinks.svelte'
  import { avatar, bio, name } from '$lib/info.js'

  /** @type {import('./$types').PageData} */
  export let data
</script>

<svelte:head>
  <title>{name}</title>
  <meta name="description" content={bio} />
</svelte:head>

<div class="flex flex-col flex-grow gap-8 pb-16 mt-6">
  <!-- bio -->

  <section class="w-full">
    <div class="flex items-center justify-between gap-4 mb-8 border-b border-zinc-100 pb-6">
      <h2 class="text-sm font-medium sm:text-base text-zinc-500 dark:text-zinc-400">
        Random Ideas.
      </h2>
    </div>
    <PostsList posts={data.posts} />
  </section>
</div>
