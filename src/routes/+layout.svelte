<script>
  import '../app.css';
  import '../prism.css';
  import MoonIcon from 'heroicons-svelte/solid/MoonIcon.svelte';
  import SunIcon from 'heroicons-svelte/solid/SunIcon.svelte';
  import { browser } from '$app/environment';
  import { name } from '$lib/info';
  import { page } from '$app/stores';

  let isDarkMode = browser ? Boolean(document.documentElement.classList.contains('dark')) : true;

  function disableTransitionsTemporarily() {
    document.documentElement.classList.add('[&_*]:!transition-none');
    window.setTimeout(() => {
      document.documentElement.classList.remove('[&_*]:!transition-none');
    }, 0);
  }
</script>

<div class="flex flex-col min-h-screen">
  <div class="flex flex-col flex-grow w-full px-4 py-2">
    <header class="flex items-center justify-between w-full max-w-2xl py-4 mx-auto lg:pb-6">
      <a
        class="text-lg font-bold sm:text-2xl !text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600 dark:to-teal-400"
        href="/"
      >
        <div style="width: 50px;">
          {@html '<svg style="filter: invert(37%) sepia(73%) saturate(1146%) hue-rotate(150deg) brightness(96%) contrast(95%);" class="svg-standalone-icon" width="100%" viewBox="65.00000000000003 194.98157658294605 72.95393805141543 80.0368468341079"><g data-paper-data="{&quot;isIcon&quot;:&quot;true&quot;,&quot;selectedEffects&quot;:{&quot;container&quot;:&quot;&quot;,&quot;transformation&quot;:&quot;&quot;,&quot;pattern&quot;:&quot;&quot;},&quot;fillRule&quot;:&quot;evenodd&quot;,&quot;fillRuleOriginal&quot;:&quot;evenodd&quot;,&quot;iconType&quot;:&quot;icon&quot;,&quot;rawIconId&quot;:&quot;2602678&quot;,&quot;iconStyle&quot;:&quot;standalone&quot;,&quot;bounds&quot;:{&quot;x&quot;:65.00000000000003,&quot;y&quot;:194.98157658294605,&quot;width&quot;:72.95393805141543,&quot;height&quot;:80.0368468341079},&quot;suitableAsStandaloneIcon&quot;:true}" fill-rule="evenodd"><path d="M113.28181,194.98158l-9.44388,37.42136h34.116l-49.4623,42.61549l9.44388,-37.89355h-32.93551zM104.90037,208.4391l-27.38724,23.96384h21.36677zM125.2047,237.12487h-22.54725l-6.02047,24.67213z" data-paper-data="{&quot;isPathIcon&quot;:true}"></path></g></svg>'}
        </div>
        <!-- {name} -->
      </a>

      <button
        type="button"
        role="switch"
        aria-label="Toggle Dark Mode"
        aria-checked={isDarkMode}
        class="w-5 h-5 sm:h-8 sm:w-8 sm:p-1"
        on:click={() => {
          isDarkMode = !isDarkMode;
          localStorage.setItem('isDarkMode', isDarkMode.toString());

          disableTransitionsTemporarily();

          if (isDarkMode) {
            document.querySelector('html').classList.add('dark');
          } else {
            document.querySelector('html').classList.remove('dark');
          }
        }}
      >
        <MoonIcon class="hidden text-zinc-500 dark:block" />
        <SunIcon class="block text-zinc-400 dark:hidden" />
      </button>
    </header>
    <main
      class="flex flex-col flex-grow w-full mx-auto"
      class:max-w-2xl={!$page.data.layout?.fullWidth}
    >
      <slot />
    </main>
  </div>
</div>
