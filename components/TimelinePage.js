export default function TimelinePage({ entries, seitenMap, goToPage }) {
  // Gruppieren nach Datum
  const datumsgruppen = {}
  entries.forEach(entry => {
    if (!datumsgruppen[entry.date]) datumsgruppen[entry.date] = []
    datumsgruppen[entry.date].push(entry)
  })

  // Beim Klick zum frühesten Eintrag des Datums springen
  function handleClick(datum) {
    const eintraegeMitDatum = datumsgruppen[datum] || []
    const seiten = eintraegeMitDatum
      .map(e => seitenMap.get(e.id))
      .filter(n => typeof n === 'number')
    const ersteSeite = Math.min(...seiten)
    if (!isNaN(ersteSeite)) goToPage(ersteSeite)
  }

  // Datumswerte sortieren (z. B. 2025-07-03 → aufsteigend)
  const sortierteDaten = Object.keys(datumsgruppen).sort((a, b) =>
    new Date(a) - new Date(b)
  )

  return (

    
    <div className="page p-8 w-full h-full text-yellow-200 bg-[#1b1b18] shadow-inner border border-yellow-900 overflow-y-auto">


<h1 className="text-5xl font-bold mb-2 text-center relative font-verzaubert flex items-center justify-center gap-2">
    <span className="text-2xl leading-none align-middle relative top-[1px]">⏳+{" "}</span>
    <span className={`relative inline-block `}>
      <span className="relative z-10 glow-pink text-pink-900">Timeline</span>   
      <span className="absolute inset-0 blur-sm animate-glimmer from-white/10 via-yellow-400/30 to-white/10" />
    </span>
    <span className="text-2xl leading-none align-middle relative top-[1px]">{" "}+⏳</span>
  </h1>
{/* 
      <p className="text-sm italic mb-6 text-yellow-400 text-center">
        Klicke auf ein Datum, um zu den zugehörigen Seiten zu springen.
      </p> */}
      <ul className="space-y-2 pt-3">
        {sortierteDaten.map(datum => (
          <li
            key={datum}
            className="cursor-pointer text-yellow-300 hover:text-white transition duration-150 ease-in-out font-sans text-sm"
            onClick={() => handleClick(datum)}
          >
            📅 {datum}{' '}
            <span className="text-sm text-yellow-500">
              ({datumsgruppen[datum].length} Eintrag{datumsgruppen[datum].length > 1 ? 'e' : ''})
              
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}