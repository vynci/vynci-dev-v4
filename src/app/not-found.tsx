import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto mt-16 w-full max-w-2xl text-center">
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="mt-4">
        That page doesn&apos;t exist.{' '}
        <Link href="/" className="font-semibold text-teal-600">
          Back to the posts
        </Link>
      </p>
    </div>
  )
}
