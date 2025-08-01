export default function Inhaltsverzeichnis({ entries, seitenMap, goToPage }) {
  // 1. Kapitel gruppieren
  const kapitelMap = {}
  entries.forEach((entry) => {
    if (!kapitelMap[entry.kapitel]) kapitelMap[entry.kapitel] = []
    kapitelMap[entry.kapitel].push(entry)
  })

  const gruppierteKapitel = Object.entries(kapitelMap)

  // 2. Spaltenaufteilung
  const mitte = Math.ceil(gruppierteKapitel.length / 2)
  const spalteLinks = gruppierteKapitel.slice(0, mitte)
  const spalteRechts = gruppierteKapitel.slice(mitte)

  // 3. Helfer: Orte + Seiten gruppieren
  function gruppiereOrteEintraege(eintraege) {
    const ortMap = {}
    eintraege.forEach((entry) => {
      const ort = entry.ort || 'unbekannter Ort'
      const seite = seitenMap.get(entry.id)
      if (!ortMap[ort]) ortMap[ort] = []
      if (seite !== undefined) ortMap[ort].push(seite)
    })
    return ortMap
  }

  function renderOrt(ort, seiten) {
    // Sortieren + Duplikate entfernen
    const uniqueSeiten = [...new Set(seiten)].sort((a, b) => a - b)

    // 🟡 Wenn nur eine Seite: Ort anklickbar
    if (uniqueSeiten.length === 1) {
      return (
        <li className="cursor-pointer hover:text-yellow-300" onClick={() => goToPage(uniqueSeiten[0])}>
          {ort} <span className="text-xs text-yellow-400 font-sans">S.{uniqueSeiten[0]}</span>
        </li>
      )
    }

    // 🔢 Sonst: Seiten einzeln anklickbar
    return (
      <li>
        {ort}{' '}
        <span className="text-xs text-yellow-400">
          {uniqueSeiten.map((s, i) => (
            <span
              key={i}
              onClick={() => goToPage(s)}
              className="cursor-pointer hover:underline hover:text-yellow-300 font-sans"
            >
              S.{s}{i < uniqueSeiten.length - 1 ? ' | ' : ''}
            </span>
          ))}
        </span>
      </li>
    )
  }

  return (
    <div className="page flex flex-col justify-start gap-4 overflow-y-auto">
  <h1 className="text-4xl font-bold mb-2 text-center relative font-verzaubert flex items-center justify-center gap-2">
    <span className="text-2xl leading-none align-middle relative top-[1px]">📖+{" "}</span>
    <span className={`relative inline-block `}>
      <span className="relative z-10 glow-yellow text-yellow-700">Inhaltsverzeichnis</span>   
      <span className="absolute inset-0 blur-sm animate-glimmer from-white/10 via-yellow-400/30 to-white/10" />
    </span>
    <span className="text-2xl leading-none align-middle relative top-[1px]">{" "}+📖</span>
  </h1>

      <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
        {/* 🧱 Linke Spalte */}
        <div className="flex flex-col gap-4">
          {spalteLinks.map(([kapitel, eintraege]) => {
            const ortMap = gruppiereOrteEintraege(eintraege)
            return (
              <div key={kapitel}>
                <h3 className="text-yellow-300 font-semibold mb-1">{kapitel}</h3>
                <ul className="list-disc pl-4">
                  {Object.entries(ortMap).map(([ort, seiten]) =>
                    renderOrt(ort, seiten)
                  )}
                </ul>
              </div>
            )
          })}
        </div>

        {/* 🧱 Rechte Spalte */}
        <div className="flex flex-col gap-4">
          {spalteRechts.map(([kapitel, eintraege]) => {
            const ortMap = gruppiereOrteEintraege(eintraege)
            return (
              <div key={kapitel}>
                <h3 className="text-yellow-300 font-semibold mb-1">{kapitel}</h3>
                <ul className="list-disc pl-4">
                  {Object.entries(ortMap).map(([ort, seiten]) =>
                    renderOrt(ort, seiten)
                  )}
                </ul>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}