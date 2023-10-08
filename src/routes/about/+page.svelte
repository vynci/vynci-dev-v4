<script>
  import SocialLinks from '$lib/components/SocialLinks.svelte';
  import { bio, name } from '$lib/info.js';
  import ArrowLeftIcon from '$lib/components/ArrowLeftIcon.svelte';
  import { afterNavigate } from '$app/navigation';
  let canGoBack = false;
  afterNavigate(({ from }) => {
    if (from && from.url.pathname.startsWith('/')) {
      canGoBack = true;
    }
  });

  function goBack() {
    if (canGoBack) {
      history.back();
    }
  }
</script>

<svelte:head>
  <title>{`About | ${name} (vynci)`}</title>
  <meta name="description" content={bio} />
</svelte:head>

<div class="hidden lg:block">
  <div class="sticky top-0 w-full flex mt-6">
    <svelte:element
      this={canGoBack ? 'button' : 'a'}
      class="items-center justify-center hidden w-10 h-10 mb-2 transition bg-white rounded-full shadow-md -top-1 -left-16 lg:flex group shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:focus-visible:ring-2 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
      href={canGoBack ? undefined : '/'}
      aria-label="Go back to posts"
      on:click={goBack}
      on:keydown={goBack}
    >
      <ArrowLeftIcon
        class="w-4 h-4 transition stroke-zinc-500 group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400"
      />
    </svelte:element>
  </div>
</div>

<div class="flex flex-col flex-grow gap-8 pb-2 mt-6">
  <section class="w-full">
    <div class="items-center justify-between gap-4 mb-8 border-b border-zinc-100 pb-6">
      <h2 class="text-sm font-medium sm:text-base text-zinc-500 dark:text-zinc-400">About me</h2>
    </div>

    <div class="mb-8">
      <p>
        A maker that tinkers between software and hardware engineering. I'm currently based in
        Toronto Canada, and recently immersed with cloud systems architecture, serverless computing,
        web-mobile applications, and IoT development.
      </p>
    </div>

    <div>
      <h2 class="text-sm font-medium sm:text-base text-zinc-500 dark:text-zinc-400">
        Get in touch
      </h2>

      <div class="mt-8">
        <p>
          I'm always open to new ideas and opportunities. Whether you have a question or just want
          to say hi. I’ll try my best to get back to you!
        </p>

        <p class="mt-4">Here are some endpoints that could help us get connected:</p>
        <ul class="mt-2" style="list-style: inside;">
          <li>github.com/vynci</li>
          <li>linkedin.com/in/vynci</li>
          <li>hello@vynci.dev</li>
        </ul>
      </div>
    </div>
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
