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
      <h1 className="text-3xl font-bold mb-4 text-yellow-300 text-center">🕰️ Timeline</h1>
      <p className="text-sm italic mb-6 text-yellow-400 text-center">
        Klicke auf ein Datum, um zu den zugehörigen Seiten zu springen.
      </p>

      <ul className="space-y-2">
        {sortierteDaten.map(datum => (
          <li
            key={datum}
            className="cursor-pointer text-yellow-300 hover:text-white transition duration-150 ease-in-out"
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