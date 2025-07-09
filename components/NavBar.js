
import Link from 'next/link'

export default function NavBar() {
  return (
    <nav className="flex gap-4 p-4 bg-parchment border-b border-ink">
      <Link href="/chronik">Chronik</Link>
      <Link href="/nscs">NSCs</Link>
      <Link href="/timeline">Zeitleiste</Link>
      <Link href="/directory">Inhaltsverzeichnis</Link>
    </nav>
  )
}
