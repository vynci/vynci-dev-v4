import { BackButton } from '@/components/BackButton'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { WhoAmI } from '@/components/WhoAmI'
import { aboutJsonLd, pageMetadata } from '@/lib/seo'
import * as site from '@/lib/site'

export const metadata = pageMetadata({
  path: '/about',
  title: 'About',
  description: `${site.name} is a software and hardware engineer in Toronto, working on cloud architecture, serverless, web and mobile apps, and IoT.`
})

export default function About() {
  return (
    <>
      <JsonLd data={aboutJsonLd()} />
      <div className="mt-6 mb-2 hidden lg:block">
        <BackButton />
      </div>

      <div className="mt-6 flex grow flex-col gap-8 pb-2">
        <section className="w-full">
          <h1 className="sr-only">About {site.name}</h1>
          <WhoAmI />

          <p className="mb-8">
            Greetings! I&apos;m {site.name}, presently immersed in the dynamic fields of software
            and hardware engineering. I&apos;m currently based in the vibrant city of Toronto,
            Canada. My recent pursuits have led me to dive deep into areas such as cloud systems
            architecture, serverless computing, the development of web and mobile applications, and
            the cutting-edge field of IoT development.
          </p>

          <h2 className="text-sm font-medium text-zinc-500 sm:text-base dark:text-zinc-400">
            Get in touch
          </h2>
          <div className="mt-8">
            <p>
              I&apos;m always open to new ideas and opportunities. Whether you have an inquiry or
              simply wish to extend a friendly greeting, don&apos;t hesitate to reach out.
            </p>
            <p className="mt-4">Here are some endpoints that could help us get connected:</p>
            <ul className="mt-2 list-inside list-disc">
              <li>
                <a
                  href={`https://github.com/${site.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  github.com/{site.github}
                </a>
              </li>
              <li>
                <a
                  href={`https://www.linkedin.com/${site.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  linkedin.com/{site.linkedin}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`}>{site.email}</a>
              </li>
            </ul>
          </div>
        </section>
        <Footer href="/" />
      </div>
    </>
  )
}
