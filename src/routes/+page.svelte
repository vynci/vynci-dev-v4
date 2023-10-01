<script>
  import PostsList from '$lib/components/PostsList.svelte';
  import SocialLinks from '$lib/components/SocialLinks.svelte';
  import { bio, name } from '$lib/info.js';

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>{`vynci (${name})`}</title>
  <meta name="description" content={bio} />
</svelte:head>

<div class="flex flex-col flex-grow gap-8 pb-2 mt-6">
  <section class="w-full">
    <div class="flex items-center justify-between gap-4 mb-8 border-b border-zinc-100 pb-6">
      <h2 class="text-sm font-medium sm:text-base text-zinc-500 dark:text-zinc-400">
        Random Ideas.
      </h2>
    </div>
    <PostsList posts={data.posts} />
  </section>

  <div class="mt-8">
    <hr />
    <div class="py-8">
      <div class="grid gap-8">
        <div class="flex justify-center order-1 col-span-2 gap-6 md:order-2">
          <SocialLinks />
        </div>

        <div
          class="flex justify-center order-1 col-span-2 gap-6 md:order-2 text-center text-sm text-zinc-400 dark:text-zinc-400"
        >
          <div>© Copyright 2023 Vince Elizaga</div>
        </div>
      </div>
    </div>
  </div>
</div>
