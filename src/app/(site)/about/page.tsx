import type { ReactNode } from 'react'
import { BackButton } from '@/components/BackButton'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { aboutJsonLd, pageMetadata } from '@/lib/seo'
import * as site from '@/lib/site'

export const metadata = pageMetadata({
  path: '/about',
  title: 'About',
  description: `${site.name} is an engineer in Toronto focused on AI, IoT and cloud infrastructure, building xorgate and alocate at Epye Labs.`
})

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
      className="font-medium text-brand-700 underline decoration-brand-600/30 underline-offset-2 transition hover:decoration-brand-600 dark:text-brand-400 dark:decoration-brand-400/35 dark:hover:decoration-brand-300"
    >
      {children}
    </a>
  )
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-10 mb-4 text-sm font-medium sm:text-base dark:text-ink-400">{children}</h2>
  )
}

export default function About() {
  return (
    <>
      <JsonLd data={aboutJsonLd()} />
      <div className="mt-6 mb-2 hidden lg:block">
        <BackButton />
      </div>

      <div className="mt-6 flex grow flex-col gap-8 pb-2">
        <section className="w-full leading-7">
          <h1 className="sr-only">About {site.name}</h1>

          <p>
            Hi, I&apos;m {site.firstName}. I&apos;m an engineer based in Toronto. I studied
            electronics engineering in college, but I&apos;ve spent the last 12+ years building
            software. These days, I&apos;m mostly working around AI, IoT, and cloud infrastructure.
            I&apos;ve always had a soft spot for hardware, though, so you&apos;ll occasionally find
            circuit boards, wiring diagrams, and the occasional hardware experiment sitting
            alongside the code on this blog.
          </p>

          <SectionTitle>What I&apos;m building now (on the side)</SectionTitle>
          <p>
            I spend some of my spare time building things at{' '}
            <ExternalLink href="https://www.epye.ca">Epye Labs</ExternalLink>, a small, bootstrapped
            R&D company. We&apos;re a small team, and right now most of our attention is going into
            two projects.
          </p>
          <p className="mt-4">
            <ExternalLink href="https://www.xorgate.io">Xorgate</ExternalLink> is our platform for
            physical AI and edge IoT. The idea is to make it easier to connect real-world devices,
            stream telemetry and live video, and build AI workflows around them without having to
            stitch everything together yourself. You can put together workflows for object
            detection, depth estimation, and vision-language queries, then inspect and label your
            own data when off-the-shelf models don&apos;t quite cut it. We&apos;re also working on
            browser-based model fine-tuning and Daedalus, a hardware development kit designed to go
            with the platform.
          </p>
          <p className="mt-4">
            <ExternalLink href="https://www.alocate.io">Alocate</ExternalLink> is built on top of
            Xorgate. It&apos;s focused on tracking and monitoring equipment in places where reliable
            power and Wi-Fi aren&apos;t always available. Think live location tracking, geofence
            alerts, and engine telemetry pulled through OBD-II. One of the more interesting parts is
            the driver behaviour analysis: we score trips based on speeding, harsh braking, and
            over-revving. We&apos;re also experimenting with detecting tailgating using object
            detection and depth estimation to measure the distance between vehicles from a
            road-facing camera.
          </p>

          <SectionTitle>Where I&apos;ve been</SectionTitle>
          <p>
            Most of my career has involved turning messy, manual processes into software that
            actually gets things done.
          </p>

          <p className="mt-4">
            At <ExternalLink href="https://dawsonpartners.com">Dawson Partners</ExternalLink>,
            I&apos;ve been building fintech solutions involving document processing, OCR,
            LLM-powered data extraction, intelligent workflows, and analytics. Before that, at{' '}
            <ExternalLink href="https://digistaff.ca">Digistaff</ExternalLink>, I worked on a
            workforce management platform spanning web, mobile, and kiosk applications.
          </p>

          <p className="mt-4">
            I also spent several years at Noaya in Oslo (remotely), working on cloud-native IoT and
            logistics systems, including a real-time vessel monitoring and telemetry project called{' '}
            <ExternalLink href="https://marinedynamics.no">Marine Dynamics</ExternalLink>. Earlier
            in my career, back in the Philippines, I worked on backend systems and product
            development at <ExternalLink href="https://www.arcanys.com">Arcanys</ExternalLink>,
            Touch-fire, and Global Zeal.
          </p>

          <p className="mt-4">
            Along the way, I&apos;ve worked across quite a few layers of the stack, from embedded
            devices and backend services to frontend applications and cloud infrastructure. I enjoy
            connecting those pieces just as much as building any one of them.
          </p>

          <SectionTitle>Say hello</SectionTitle>
          <p>
            Got an idea you&apos;d like to build together, a question about a post, or just want to
            say hi? I&apos;d love to hear from you.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1">
            <li>
              Email: <ExternalLink href={`mailto:${site.email}`}>{site.email}</ExternalLink>
            </li>
            <li>
              GitHub:{' '}
              <ExternalLink href={`https://github.com/${site.github}`}>
                github.com/{site.github}
              </ExternalLink>
            </li>
            <li>
              LinkedIn:{' '}
              <ExternalLink href={`https://www.linkedin.com/${site.linkedin}`}>
                linkedin.com/{site.linkedin}
              </ExternalLink>
            </li>
          </ul>
        </section>
        <Footer href="/" />
      </div>
    </>
  )
}
