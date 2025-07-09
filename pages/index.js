
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center text-ink font-serif">
      <h1 className="text-4xl mb-6">Willkommen in deiner RPG-Chronik</h1>
      <Link href="/chronik" className="underline text-blue-700">Zur Chronik</Link>
    </div>
  )
}
