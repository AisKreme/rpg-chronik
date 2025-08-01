// pages/chronik.js

import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseUrl } from '../lib/supabaseClient'
import ChronikPage from '../components/ChronikPage'
import HTMLFlipBook from 'react-pageflip'
import EntryPopup from '../components/EntryPopup'
import Inhaltsverzeichnis from '../components/Inhaltsverzeichnis'
import TimelinePage from '../components/TimelinePage'
import NSCPage from '../components/NSCPage'
import MapPage from '../components/MapPage'
import LegendPage from '../components/LegendPage'
import { deleteChronikEntry, deleteNSCEntry, deleteMonsterEntry } from '../lib/deleteHelpers'
import MonsterPage from '../components/MonsterPage'



export default function Chronik() {

  // 📋 Allgemeine Zustände
  const [entries, setEntries] = useState([])
  const [visibleFlowIds, setVisibleFlowIds] = useState([])
  const [editId, setEditId] = useState(null)
  const [editNSCId, setEditNSCId] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [suchbegriff, setSuchbegriff] = useState('')
  const bookRef = useRef(null)
  const [aktiveSeite, setAktiveSeite] = useState(0)
  const [initialKapitel, setInitialKapitel] = useState('')
  const pageRefs = useRef({}) // z. B. { [entry.id]: HTMLElement }
  const [images, setImages] = useState([])
  const [maps, setMaps] = useState([])

  // 🔍 Gefilterte Einträge (Suche)
  const gefilterteEintraege = entries.filter(entry => {
    const text = `${entry.note} ${entry.flow} ${entry.kapitel} ${entry.ort} ${(entry.tags || []).join(' ')}`
    return text.toLowerCase().includes(suchbegriff.toLowerCase())
  })

  const [nscs, setNSCs] = useState([])
    const [entryType, setEntryType] = useState('chronik') // Standard: Chronik-Eintrag
    const [selectedNSC, setSelectedNSC] = useState(null)


  const [monster, setMonster] = useState([])
  const [selectedMonster, setSelectedMonster] = useState(null)


    //fade in
     const [visible, setVisible] = useState(false);

  useEffect(() => {
    const allowed = sessionStorage.getItem('hasAccess');
    if (!allowed) {
      router.push('/');
    } else {
      setTimeout(() => {
        setVisible(true); // Startet den Fade-In
      }, 50); // kleine Verzögerung, damit Animation greift
    }
  }, []);


async function fetchMonsters() {
  const { data, error } = await supabase
    .from('monsters')
    .select('*')
    .order('id', { ascending: true })
  if (!error) setMonster(data)
}


      async function fetchMaps() {
        const { data, error } = await supabase
          .from('maps')
          .select('*')
          .order('id', { ascending: true })

        if (!error) setMaps(data)
      }

      useEffect(() => {
        fetchEntries()
        fetchNSCs()
        fetchMaps()
        fetchMonsters()
      }, [])

    useEffect(() => {
      function handleKeyDown(e) {
        const tag = document.activeElement.tagName.toLowerCase()
        if (tag === 'input' || tag === 'textarea') return

        if (e.key === 'ArrowLeft') {
          goPrev()
        } else if (e.key === 'ArrowRight') {
          goNext()
        }
      }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])

//NEU
  async function fetchEntries() {
    const { data, error } = await supabase
      .from('chronik_entries')
      .select('*')
      .order('id', { ascending: true })

    if (!error) setEntries(data)
  }

  //NEU
  async function fetchNSCs() {
  const { data, error } = await supabase
    .from('nscs')
    .select('*')
    .order('id', { ascending: true })

  if (!error) setNSCs(data)
}


    //EDIT Chronk
    function handleEditChronik(entry) {
      setEditId(entry.id)
      setEditNSCId(null) // sicherstellen, dass NSC nicht gesetzt ist
      setEntryType('chronik')
      setSelectedNSC(null)
      setShowPopup(true)
    }

    //EDIT NSC
  function handleEditNSC(nsc) {
      setEditNSCId(nsc.id)
      setEditId(null) // sicherstellen, dass Chronik nicht gesetzt ist
      setEntryType('nsc')
      setSelectedNSC(nsc)
      setShowPopup(true)
    }

    //EDIT Monster
      const handleEditMonster = (entry) => {
        setEditId(null)
        setEditNSCId(null)
        setSelectedNSC(null)
        setEntryType('monster')
        setSelectedMonster(entry)
        setShowPopup(true)
      }


// Chronik Löschen
const onDeleteChronikEntry = async (entry) => {
  await deleteChronikEntry(entry)
  await fetchEntries()
}


  // NSC Löschen
const handleDeleteNSC = async (entry) => {
  await deleteNSCEntry(entry)
  await fetchNSCs()
}

// Monster löschen
const handleDeleteMonster = async (entry) => {
  await deleteMonsterEntry(entry)
  await fetchMonsters()
}

    //NEU
    function openNewEntryPopup(type = 'chronik') {
      setEntryType(type)
      setEditId(null)
      setEditNSCId(null)
      setSelectedNSC(null)
      setSelectedMonster(null)
      setEntryType(type)

      let letztesKapitel = ''
      if (type === 'chronik' && entries.length > 0) {
        letztesKapitel = entries[entries.length - 1]?.kapitel || ''
      }

      setShowPopup(true)
      setInitialKapitel(letztesKapitel) // falls du initialKapitel verwendest
    }

    //NEU
    async function fetchAllEintraege() {
        await Promise.all([fetchEntries(), fetchNSCs(), fetchMonsters(), fetchMaps()])
      }


  function toggleFlow(id) {
    setVisibleFlowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }


        // 📖 Seitenaufbau vorbereiten – inklusive Inhaltsverzeichnis und Timeline
        const pages = []

        // ➤ Seite 0: Inhaltsverzeichnis (rechte Einzelseite)
        pages.push({ id: 'inhalt', note: '📖 Inhaltsverzeichnis', flow: '', ort: '', kapitel: '', tags: [] })

        // ➤ Hauptseiten: Chronik-Einträge
        pages.push(...gefilterteEintraege.map(e => ({ ...e, typ: 'chronik' })))

        /* --- SC/NSC-Bereich vorbereiten --- */

        // ➤ NSCs nach ID sortieren
        const sortierteNSCs = [...nscs].sort((a, b) => a.id - b.id)

        // ➤ Ggf. Leerseite einfügen, damit SCs auf rechter Seite starten
        const indexVorErsterSCSeite = pages.length
        const brauchtLeerseiteVorSCs = indexVorErsterSCSeite % 2 === 0
        if (brauchtLeerseiteVorSCs) {
          pages.push(null) // ❌ Leerseite, damit SCs rechts starten
        }

        // ➤ Spielercharaktere: genau 6 Stück, je 1 pro Seite (3 Doppelseiten)
        const spielerCharaktere = sortierteNSCs.slice(0, 6)
        const ersteSCSeite = pages.length
        pages.push(...spielerCharaktere.map((nsc, index) => ({
          eintrag: nsc,
          id: `sc-${index}`,
          typ: 'sc'
        })))

        // ➤ NSCs (restliche): je 2 pro Seite
        const restlicheNSCs = sortierteNSCs.slice(6)
        const nscGroups = []
        for (let i = 0; i < restlicheNSCs.length; i += 2) {
          nscGroups.push(restlicheNSCs.slice(i, i + 2))
        }

        const ersteNSCSeite = pages.length
        pages.push(...nscGroups.map((gruppe, index) => ({
          id: `nsc-page-${index}`,
          typ: 'nsc',
          gruppe
        })))

        // 🧱 Stelle sicher, dass MapPage auf einer linken Seite (ungerader Index) beginnt
        if (pages.length % 2 === 0) {
          // wir stehen auf rechter Seite → Leerseite einfügen, um maps links zu starten
          pages.push(null)
        }

      // 🗺 Jetzt beginnt die MapPage auf einer linken Seite
      const ersteMapSeite = pages.length

        maps.forEach((map) => {
          pages.push({ typ: 'map-left', map })       // linke Seite = Karte
          pages.push({ typ: 'map-legend', map })     // rechte Seite = Legende
        })

        pages.push({ typ: 'map-left', map: null })
        pages.push({ typ: 'map-legend', map: null })



        
        //Monster Seiten
        const ersteMonsterSeite = pages.length

        monster.forEach((monster) => {
         pages.push({ typ: 'monster', monster, id: `monster-${monster.id}` })
        })

        // ➤ Ggf. Leerseite einfügen, damit Timeline auf linker Seite erscheint
        const totalWithoutTimeline = pages.length
        const needsEmptyPageBeforeTimeline = totalWithoutTimeline % 2 === 0
        if (needsEmptyPageBeforeTimeline) pages.push(null)

        // ➤ Letzte Seite: Timeline (linke Einzelseite / Rückseite)
        pages.push({ id: 'timeline', note: '📅 Timeline', flow: '', ort: '', kapitel: '', tags: [] })

/* --- Bookmarks + Helper --- */

        const letzteSeite = pages.length - 1 // Timeline ist letzte Seite
        const letzteChronikSeite = pages.findIndex(p => p?.id === entries.at(-1)?.id)
        const seitenIndexMap = new Map()

        pages.forEach((entry, i) => {
          if (entry && entry.id && entry.id !== 'inhalt' && entry.id !== 'timeline') {
            seitenIndexMap.set(entry.id, i)
          }
        })

    function geheZuSeite(nr) {
      bookRef.current?.pageFlip().flip(nr)
    }

      const scrollToEntry = (id) => {
        const index = entries.findIndex((e) => e.id === id)
        if (index === -1) return
        const page = index % 2 === 0 ? index : index - 1
        setTimeout(() => {
          bookRef.current?.pageFlip().flip(page)
        }, 200)
      }
  
  //Pfeiltasten Seiten Move
  function goNext() {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext()
    }
  }

  function goPrev() {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev()
    }
  }


        function getBookmarkStufe(seite) {
      const typ = pages[seite]?.typ
      if (seite === 0) return -1 // Inhaltsverzeichnis → Spezialfall: alles rechts
      if (typ === 'chronik') return 1
      if (typ === 'sc') return 2
      if (typ === 'nsc') return 3
      if (typ?.startsWith('map')) return 4
      if (typ?.startsWith('monster')) return 5
      if (typ === undefined && seite === letzteSeite) return 6 // Timeline
      return 1
    }

return (
<div
    className={`min-h-screen bg-neutral-900 text-white transition-opacity duration-1000 ease-out ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
  >
  <>
      <div className="flex justify-center items-center min-h-screen bg-[#1c1b18]">
  <div className="relative w-[900px] bg-[#1c1b18] border border-yellow-700 rounded-lg p-4 shadow-xl">

{(() => {
  const stufe = getBookmarkStufe(aktiveSeite)

  if (stufe === -1) {
    // Inhaltsverzeichnis: alles rechts
    return (
      <div className="absolute right-0 top-0 flex flex-col items-end pointer-events-none">
        <div className="absolute top-[90px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-1" onClick={() => geheZuSeite(0)}>Inhalt&nbsp; 🧾</div>
        <div className="absolute top-[170px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-2" onClick={() => geheZuSeite(letzteChronikSeite)}>Chronik&nbsp; 📚</div>
        <div className="absolute top-[250px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-3" onClick={() => geheZuSeite(ersteSCSeite)}>SCs&nbsp; 🧙</div>
        <div className="absolute top-[330px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-4" onClick={() => geheZuSeite(ersteNSCSeite)}>NSCs&nbsp; 🧌</div>
        <div className="absolute top-[410px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-5" onClick={() => geheZuSeite(ersteMapSeite)}>Maps&nbsp; 🗺</div>
        <div className="absolute top-[490px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-6" onClick={() => geheZuSeite(ersteMonsterSeite)}>Monster&nbsp; 👹</div>
        <div className="absolute top-[570px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-7" onClick={() => geheZuSeite(letzteSeite)}>Timeline&nbsp; ⏳</div>
      </div>
    )
  }

  if (stufe === 6) {
    // Timeline: alles links
    return (
      <div className="absolute left-0 top-0 flex flex-col items-start pointer-events-none">
        <div className="absolute top-[90px] pl-[0.6rem] bookmark pointer-events-auto bookmark-1" onClick={() => geheZuSeite(0)}>🧾&nbsp; Inhalt</div>
        <div className="absolute top-[170px] pl-[0.6rem] bookmark pointer-events-auto bookmark-2" onClick={() => geheZuSeite(letzteChronikSeite)}>📚&nbsp; Chronik</div>
        <div className="absolute top-[250px] pl-[0.6rem] bookmark pointer-events-auto bookmark-3" onClick={() => geheZuSeite(ersteSCSeite)}>🧙&nbsp; SCs</div>
        <div className="absolute top-[330px] pl-[0.6rem] bookmark pointer-events-auto bookmark-4" onClick={() => geheZuSeite(ersteNSCSeite)}>🧌&nbsp; NSCs</div>
        <div className="absolute top-[410px] pl-[0.6rem] bookmark pointer-events-auto bookmark-5" onClick={() => geheZuSeite(ersteMapSeite)}>🗺&nbsp; Maps</div>
        <div className="absolute top-[490px] pl-[0.6rem] bookmark pointer-events-auto bookmark-6" onClick={() => geheZuSeite(ersteMonsterSeite)}>👹&nbsp; Monster</div>
        <div className="absolute top-[570px] pl-[0.6rem] bookmark pointer-events-auto bookmark-7" onClick={() => geheZuSeite(letzteSeite)}>⏳&nbsp; Timeline</div>
      </div>
    )
  }

  return (
    <>
      <div className="absolute left-0 top-0 flex flex-col items-start pointer-events-none">
        {stufe >= 1 && (
          <div className="absolute top-[90px] pl-[0.6rem] bookmark pointer-events-auto bookmark-1" onClick={() => geheZuSeite(0)}>🧾&nbsp; Inhalt</div>
        )}
        {stufe >= 1 && (
          <div className="absolute top-[170px] pl-[0.6rem] bookmark pointer-events-auto bookmark-2" onClick={() => geheZuSeite(letzteChronikSeite)}>📚&nbsp; Chronik</div>
        )}
        {stufe >= 2 && (
          <div className="absolute top-[250px] pl-[0.6rem] bookmark pointer-events-auto bookmark-3" onClick={() => geheZuSeite(ersteSCSeite)}>🧙&nbsp; SCs</div>
        )}
        {stufe >= 3 && (
          <div className="absolute top-[330px] pl-[0.6rem] bookmark pointer-events-auto bookmark-4" onClick={() => geheZuSeite(ersteNSCSeite)}>🧌&nbsp; NSCs</div>
        )}
        {stufe >= 4 && (
          <div className="absolute top-[410px] pl-[0.6rem] bookmark pointer-events-auto bookmark-5" onClick={() => geheZuSeite(ersteMapSeite)}>🗺&nbsp; Maps</div>
        )}
        {stufe >= 5 && (
          <div className="absolute top-[490px] pl-[0.6rem] bookmark pointer-events-auto bookmark-6" onClick={() => geheZuSeite(ersteMonsterSeite)}>👹&nbsp; Monster</div>
        )}
      </div>

      <div className="absolute right-0 top-0 flex flex-col items-end pointer-events-none">
        {stufe < 2 && (
          <div className="absolute top-[250px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-3" onClick={() => geheZuSeite(ersteSCSeite)}>SCs&nbsp; 🧙</div>
        )}
        {stufe < 3 && (
          <div className="absolute top-[330px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-4" onClick={() => geheZuSeite(ersteNSCSeite)}>NSCs&nbsp; 🧌</div>
        )}
        {stufe < 4 && (
          <div className="absolute top-[410px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-5" onClick={() => geheZuSeite(ersteMapSeite)}>Maps&nbsp; 🗺</div>
        )}
        {stufe < 5 && (
          <div className="absolute top-[490px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-6" onClick={() => geheZuSeite(ersteMonsterSeite)}>Monster&nbsp; 👹</div>
        )}
        {stufe < 6 && (
          <div className="absolute top-[570px] pr-[0.6rem] bookmark-right pointer-events-auto bookmark-7" onClick={() => geheZuSeite(letzteSeite)}>Timeline&nbsp; ⏳</div>
        )}
      </div>
    </>
  )
})()}


      {/* 🔍 Suchleiste über dem Buch */}
      <div className="hidden md:flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Suche nach Schlagwort, Ort, Kapitel ..."
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          className="w-[60%] px-4 py-2 rounded-lg border border-yellow-700 bg-[#2d2a24] text-yellow-300/80 placeholder-yellow-500/30 shadow-lg shadow-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition duration-300 font-sans"
        />
      </div>


    {/* 📖 FlipBook */}
    <HTMLFlipBook
      width={420}
      height={550}
      size="fixed"
      minWidth={420}
      maxWidth={840}
      minHeight={550}
      maxHeight={1100}
      showCover={true}
      drawShadow={true}
      ref={bookRef}
      useMouseEvents={false}
      mobileScrollSupport={true}
      className="flipbook"
      onFlip={(e) => setAktiveSeite(e.data)}
    >

 {pages.map((entry, idx) => {


          if (entry?.typ === 'map-left') {
            return (
              <div key={idx} className="page">
                <MapPage map={entry.map ?? null} />
              </div>
            )
          }

          if (entry?.typ === 'map-legend') {
            return (
              <div key={idx} className="page">
                <LegendPage
                  mapType="Neu"
                  title={entry.map?.title ?? ''}
                  description={entry.map?.beschreibung ?? ''}
                  images={entry.map?.images ?? []}
                  editMapId={entry.map?.id ?? null}
                />
              </div>
            )
          }



 return (
  <div key={idx} className="pointer-events-auto">
    { entry?.id === 'inhalt' ? (
      <Inhaltsverzeichnis
        entries={gefilterteEintraege}
        seitenMap={seitenIndexMap}
        goToPage={(n) => bookRef.current?.pageFlip().flip(n)}
      />
    ) : entry?.id === 'timeline' ? (
      <TimelinePage
        entries={entries}
        seitenMap={seitenIndexMap}
        goToPage={geheZuSeite}
      />
    ) : !entry || entry.typ === 'empty' ? (
  <div
    className="page relative w-[420px] h-[530px] overflow-hidden border border-yellow-700 bg-[#1a1e24] text-parchment p-4 shadow-xl flex items-center justify-center"
  >
    <p className="text-yellow-600 text-center italic text-sm">
      ❌ Kein Eintrag vorhanden.
    </p>
  </div>
) : entry?.typ === 'nsc' || entry?.typ === 'sc' ? (
      <NSCPage
        ref={(el) => el && entry?.id && (pageRefs.current[entry.id] = el)}
        eintrag={entry}
        onNSCDelete={(entry) => handleDeleteNSC(entry)}
        onNSCEdit={handleEditNSC}
      />
    ) : entry?.typ === 'monster' ? (
      <MonsterPage
        key={entry.id}
        eintrag={entry.monster}
        onMonsterDelete={handleDeleteMonster}
        onMonsterEdit={handleEditMonster}
        idx={idx}
      />
    ) : (
      <ChronikPage
        ref={(el) => el && entry?.id && (pageRefs.current[entry.id] = el)}
        entry={entry}
        idx={idx}
        visibleFlowIds={visibleFlowIds}
        toggleFlow={toggleFlow}
        handleEntryDelete={(entry) => onDeleteChronikEntry(entry)}
        handleEdit={handleEditChronik}
      />
    )}
  </div>
)
})}
    </HTMLFlipBook>

    {/* 🔘 Navigationsleiste Unten*/}
    <div className="mt-4 flex justify-between items-center px-8">
      <button onClick={goPrev} className="magical-btn">⬅ Zurück</button>
      <button
        onClick={() => openNewEntryPopup()}
        className="magical-btn bg-green-900 hover:bg-green-800"
      >
        ✨ Neuer Eintrag ✨
      </button>
      <button onClick={goNext} className="magical-btn">Weiter ➡</button>
    </div>
  </div>
      </div>

    {/* 🪄 Popup für neuen oder bearbeiteten Eintrag */}
          <EntryPopup
            show={showPopup}
            onClose={() => {
              setShowPopup(false)
              setEditId(null)
              setEditNSCId(null)
              setSelectedNSC(null)
            }}
            visibleFlowIds={visibleFlowIds}
            toggleFlow={toggleFlow}
            entries={entries}  
            entryType={entryType}
            setEntryType={setEntryType}
            selectedNSC={selectedNSC}
            setSelectedNSC={setSelectedNSC}
            scrollToEntry={scrollToEntry}
            initialKapitel={initialKapitel}
            setInitialKapitel={setInitialKapitel}
            editId={editId} 
            editNSCId={editNSCId} 
            refreshEntries={fetchAllEintraege}
            selectedMonster={selectedMonster}
            setSelectedMonster={setSelectedMonster}
          />
        
  </>
  </div>
)
}