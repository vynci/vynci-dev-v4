// Home and about: the narrow centered column. Post pages set their own wider grid.
export default function SiteLayout({ children }: LayoutProps<'/'>) {
  return <div className="mx-auto flex w-full max-w-2xl grow flex-col">{children}</div>
}
