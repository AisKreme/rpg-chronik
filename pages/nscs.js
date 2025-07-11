import { supabase } from '../lib/supabaseClient'

export default function NSCPage({ nscs, onEdit, onDelete }) {
  const playerChars = nscs.filter(n => n.rolle === 'SC')
  const nscEntries = nscs.filter(n => n.rolle !== 'SC')

  // Spielercharakter-Seiten (4 Seiten = 2 Doppelseiten, je 1 Eintrag pro Seite)
  const playerPages = []
  for (let i = 0; i < 4; i++) {
    const char = playerChars[i]
    playerPages.push(
      <div key={`pc-${i}`} className="relative w-[420px] h-[550px] border border-yellow-700 bg-[#2d2a24] text-parchment p-4 shadow-xl font-serif overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-yellow-300 text-center">🧙 Spielercharaktere</h1>
        {char ? (
          <div className="relative border border-yellow-700 p-3 rounded bg-[#1f1d1a] shadow">
            <button
              onClick={() => onEdit(char)}
              className="absolute top-2 right-8 text-sm hover:scale-110"
            >✏️</button>
            <button
              onClick={() => onDelete(char.id)}
              className="absolute top-2 right-2 text-sm hover:scale-110"
            >🗑️</button>
            <h3 className="text-lg font-bold text-yellow-300">{char.name}</h3>
            <p className="italic text-yellow-500">{char.rolle}</p>
            <p className="mt-1 text-sm">{char.info}</p>
            {char.images?.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {char.images.map((url, i) => (
                  <img key={i} src={url} className="w-full h-20 object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-yellow-500 mt-20">❌ Kein Eintrag vorhanden.</div>
        )}
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-yellow-600 font-serif tracking-wide select-none">
          Spielercharaktere
        </div>
      </div>
    )
  }

  // NSC-Seiten: je 2 NSCs pro Seite
  const nscPages = []
  for (let i = 0; i < nscEntries.length; i += 2) {
    const n1 = nscEntries[i]
    const n2 = nscEntries[i + 1]
    nscPages.push(
      <div key={`nsc-${i}`} className="relative w-[420px] h-[550px] border border-yellow-700 bg-[#2d2a24] text-parchment p-4 shadow-xl font-serif overflow-y-auto">
        <h1 className="text-2xl font-bold mb-2 text-yellow-300 text-center">🧙 NSCs</h1>
        {[n1, n2].filter(Boolean).map((nsc, j) => (
          <div key={nsc.id} className="relative border border-yellow-700 p-3 mb-4 rounded bg-[#1f1d1a] shadow">
            <button
              onClick={() => onEdit(nsc)}
              className="absolute top-2 right-8 text-sm hover:scale-110"
            >✏️</button>
            <button
              onClick={() => onDelete(nsc.id)}
              className="absolute top-2 right-2 text-sm hover:scale-110"
            >🗑️</button>
            <h3 className="text-lg font-bold text-yellow-300">{nsc.name}</h3>
            <p className="italic text-yellow-500">{nsc.rolle}</p>
            <p className="mt-1 text-sm">{nsc.info}</p>
            {nsc.images?.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-1">
                {nsc.images.map((url, i) => (
                  <img key={i} src={url} className="w-full h-16 object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-yellow-600 font-serif tracking-wide select-none">
          NSCs
        </div>
      </div>
    )
  }

  return [...playerPages, ...nscPages]
} 