// Site-wide constants. Replaces src/lib/info.js from the SvelteKit site.

// Canonical origin. The apex domain redirects here (Vercel domain setting).
export const url = 'https://www.vynci.dev'

export const firstName = 'Vince'
export const lastName = 'Elizaga'
export const name = `${firstName} ${lastName}`
export const handle = 'vynci'

export const title = `${name} (${handle})`
export const description =
  'Notes on cloud architecture, serverless, IoT and robotics by Vince Elizaga, a software and hardware engineer in Toronto.'

export const avatar = '/avatar.jpg'

// Social profiles; empty strings are not rendered.
export const github = 'vynci'
export const linkedin = 'in/vynci'
export const twitter = ''
export const instagram = ''
export const devto = ''
export const email = 'hello@vynci.dev'
