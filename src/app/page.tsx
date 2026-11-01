// Placeholder until P2 ports the post list.
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-2xl font-bold">vynci.dev</h1>
      <p className="mt-4">Next.js rebuild in progress.</p>
      <div className="prose mt-8 dark:prose-invert">
        <h2>Typography check</h2>
        <p>
          A paragraph with a <a href="https://github.com/vynci">link</a>, some <strong>bold</strong>{' '}
          text and <code>inline code</code>.
        </p>
        <pre className="language-js">
          <code className="language-js">
            <span className="token keyword">const</span> x <span className="token operator">=</span>{' '}
            <span className="token string">&apos;hello&apos;</span>
          </code>
        </pre>
      </div>
    </main>
  )
}
