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
import { deleteChronikEntry, deleteNSCEntry } from '../lib/deleteHelpers'




export default function Chronik() {
// // 📋 State-Variablen für Eintragsdaten
//   const [note, setNote] = useState('')
//   const [flow, setFlow] = useState('')
//   const [kapitel, setKapitel] = useState('')
//   const [ort, setOrt] = useState('')
//   const [tags, setTags] = useState('')

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

  // 🔍 Gefilterte Einträge (Suche)
  const gefilterteEintraege = entries.filter(entry => {
    const text = `${entry.note} ${entry.flow} ${entry.kapitel} ${entry.ort} ${(entry.tags || []).join(' ')}`
    return text.toLowerCase().includes(suchbegriff.toLowerCase())
  })

  const [nscs, setNSCs] = useState([])
    const [entryType, setEntryType] = useState('chronik') // Standard: Chronik-Eintrag
    const [selectedNSC, setSelectedNSC] = useState(null)

    // const [name, setName] = useState('')
    // const [rolle, setRolle] = useState('')
    // const [info, setInfo] = useState('')
    // const [images, setImages] = useState([])

    useEffect(() => {
      fetchEntries()
      fetchNSCs()
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
  
  // Vielleicht LÖSCHE - Selbstversuch
  // async function fetchNSCs() {
  //     const { data, error } = await supabase
  //       .from('nscs')
  //       .select('id, name, rolle, info, images')
  //       .order('created_at', { ascending: true })
  //     if (!error) setNSCs(data)
  //   }

    //LÖSCHEN
    //     function onDeleteChronikEntry(id) {
    //   if (!confirm('Eintrag wirklich löschen?')) return
    //   deleteChronikEntry(id).then(() => fetchEntries())
    // }

    //NEU
    function handleEditChronik(entry) {
      setEditId(entry.id)
      setEditNSCId(null) // sicherstellen, dass NSC nicht gesetzt ist
      setEntryType('chronik')
      setSelectedNSC(null)
      setShowPopup(true)
    }

    //NEU
  function handleEditNSC(nsc) {
      setEditNSCId(nsc.id)
      setEditId(null) // sicherstellen, dass Chronik nicht gesetzt ist
      setEntryType('nsc')
      setSelectedNSC(nsc)
      setShowPopup(true)
    }
    


//NEU
const onDeleteChronikEntry = async (id) => {
  await deleteChronikEntry(id)
  await fetchEntries()
}


  //NEU
const handleDeleteNSC = async (id) => {
  await deleteNSCEntry(id)
  await fetchNSCs()
}

//LÖSCHEN

// const handleNSCSubmit = async () => {
//   console.log('🧪 [handleNSCSubmit STARTED]');
//   console.log('📝 Eingabedaten:', { editNSCId, name, rolle, info, images });

//   // 🔁 Bestehenden NSC aktualisieren
//   if (editNSCId) {
//     console.log('✏️ Versuche Update für ID:', editNSCId);
//     const { error } = await supabase
//       .from('nscs')
//       .update({ name, rolle, info, images })
//       .eq('id', editNSCId);
      

//     if (error) {
//       console.error('❌ Fehler beim Aktualisieren:', error.message);
//       alert('Fehler beim Aktualisieren: ' + error.message);
//     } else {
//       console.log('✅ Update erfolgreich für NSC-ID:', editNSCId);
//       resetForm();
//     }
//     return;
//   }

//   // ➕ Neuer NSC wird erstellt
//   console.log('➕ Neuer NSC wird erstellt...');
//   const insertPayload = { name, rolle, info };
//   console.log('📦 Insert-Daten:', insertPayload);

//   const { data, error } = await supabase
//     .from('nscs')
//     .insert(insertPayload)
//     .select('id')
//     .single();

//   if (error) {
//     console.error('❌ Fehler beim INSERT:', error.message);
//     alert('Fehler beim Erstellen: ' + error.message);
//     return;
//   }

//   console.log('✅ NSC erstellt mit ID:', data.id);
//   const newId = data.id.toString();

//   // 📦 Bilder verschieben aus temp in npcs/<newId>
//   console.log('📂 Verschiebe Bilder nach Ordner npcs/' + newId);
//   const movedImages = await moveImagesToFinalFolder(images, newId, 'npcs');
//   console.log('📦 Neue Bildpfade:', movedImages);

//   // 🔄 Bilder im NSC-Eintrag nachträglich speichern
//   const { error: updateError } = await supabase
//     .from('nscs')
//     .update({ images: movedImages })
//     .eq('id', newId);

//   if (updateError) {
//     console.error('❌ Fehler beim Bild-Update:', updateError.message);
//     alert('Fehler beim Hinzufügen der Bilder: ' + updateError.message);
//     return;
//   }

//   console.log('✅ Bilder aktualisiert für NSC-ID:', newId);
//   if (fetchNSCs) await fetchNSCs()
//   if (scrollToEntry) scrollToEntry(newId)

//   // 🧹 Formular zurücksetzen
//   setEditNSCId(null);
//   setImages([]);
//   resetForm();
//   console.log('🎉 Vorgang abgeschlossen – NSC gespeichert');
// };

 

//LÖSCHEN

// function resetForm(newId = null) {
//   // Chronik-Felder
//   setNote('')
//   setFlow('')
//   setKapitel('')
//   setOrt('')
//   setTags('')
//   setEditId(null)

//   // NSC-Felder
//   setName('')
//   setRolle('')
//   setInfo('')
//   setEditNSCId?.(null)
//   setSelectedNSC(null)

//   // Allgemeines
//   setImages([])
//   setEntryType('chronik')

//   // Optionales Scrollen
//   if (newId) {
//     scrollToEntry?.(newId)
//   }

//   // Nachladen
//   fetchEntries?.()
//   fetchNSCs?.()
// }


// function handleEdit(entry) {
//   setEditId(entry.id)
//   setEntryType('chronik')
//   setImages(entry.images || [])
//   setShowPopup(true)
// }


    //NEU
    function openNewEntryPopup(type = 'chronik') {
      setEntryType(type)
      setEditId(null)
      setEditNSCId(null)
      setSelectedNSC(null)
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
      await Promise.all([fetchEntries(), fetchNSCs()])
    }



// LÖSCHEN
// function openNewEntryPopup(type = 'chronik') {
//   setEntryType(type)
//   if (type === 'chronik' && !editId) {
//     const letztesKapitel = entries[entries.length - 1]?.kapitel || ''
//     setKapitel(letztesKapitel)
//   }
//   setSelectedNSC(null)
//   setShowPopup(true)
// }


 


  // LÖSCHEN


  //   const handleSubmit = async (e = null) => {
  //     if (e) e.preventDefault()
  //     const heute = new Date().toLocaleDateString('de-DE')

  //   const payload = {
  //     note,
  //     flow,
  //     kapitel,
  //     ort,
  //     tags: tags.split(',').map((t) => t.trim()),
  //     date: heute,
  //     images,
  //   }

  //   if (editId) {
  //     const { error } = await supabase
  //       .from('chronik_entries')
  //       .update(payload)
  //       .eq('id', editId)

  //     if (error) alert('Fehler beim Aktualisieren: ' + error.message)
  //     else {
  //       resetForm()
  //     }
  //   } else {
  //     const { data, error } = await supabase
  //       .from('chronik_entries')
  //       .insert(payload)
  //       .select('id')
  //       .single()

        
  //     if (error) alert('Fehler: ' + error.message)
  //     else {
  //       resetForm()
  //     }
  //   }
  // }

  function toggleFlow(id) {
    setVisibleFlowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

//LÖSCHEN

 // async function moveImagesToFinalFolder(images, newId, bucket) {
//   const movedUrls = []

//   for (const url of images) {
//     if (!url.includes('/temp/')) {
//       movedUrls.push(url)
//       continue
//     }

//     const oldPath = url.split('/storage/v1/object/public/')[1]
//     const filename = oldPath.split('/').pop()
//     const newPath = `${newId}/${filename}`

//     const { error: copyError } = await supabase
//       .storage
//       .from(bucket)
//       .copy(oldPath, newPath)

//     if (copyError) {
//       console.error('Fehler beim Kopieren:', copyError)
//       continue
//     }

//     await supabase.storage.from(bucket).remove([oldPath])

//    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${newPath}`
//     movedUrls.push(publicUrl)
//   }

//   return movedUrls
// }

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

        // ➤ Spielercharaktere: genau 4 Stück, je 1 pro Seite (2 Doppelseiten)
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

        const ersteMapSeite = pages.length
      // ➤ Map-Doppelseite vorbereiten
          pages.push( { typ: 'map-left', mapType: 'world' })
           pages.push( { typ: 'map-legend', mapType: 'world' })
       // pages.push({ id: 'map-3', typ: 'map', note: '🗺 Karte 3' })

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

//LÖSCHEN
// const handleDeleteNSC = async (id) => {
//   const confirmed = confirm('NSC wirklich löschen?')
//   if (!confirmed) return

//   await deleteAllImages(id, 'npcs')
//   await supabase.from('nscs').delete().eq('id', id)
//   fetchNSCs()
//}



return (
  <>
      <div className="flex justify-center items-center min-h-screen bg-[#1c1b18]">
  <div className="relative w-[900px] bg-[#1c1b18] border border-yellow-700 rounded-lg p-4 shadow-xl">
          {/* 📖 Linke oder Rechte Bookmarks je nach Seite */}
            {/* 🔖 Inhaltsseite: Alle rechts */}
{aktiveSeite === 0 && (
  <div className="absolute right-0 top-0 flex flex-col items-end pointer-events-none">
    <div className="absolute top-[120px] pr-[0.6rem] bookmark-right bookmark-1 pointer-events-auto" onClick={() => geheZuSeite(0)}>Inhalt 🧾</div>
    <div className="absolute top-[200px] pr-[0.6rem] bookmark-right bookmark-2 pointer-events-auto" onClick={() => geheZuSeite(letzteChronikSeite)}>Chronik 📚</div>
    <div className="absolute top-[280px] pr-[0.6rem] bookmark-right bookmark-3 pointer-events-auto" onClick={() => geheZuSeite(ersteSCSeite)}>SCs 🧙</div>
    <div className="absolute top-[360px] pr-[0.6rem] bookmark-right bookmark-4 pointer-events-auto" onClick={() => geheZuSeite(ersteNSCSeite)}>NSCs 🧝</div>
    <div className="absolute top-[440px] pr-[0.6rem] bookmark-right bookmark-5 pointer-events-auto" onClick={() => geheZuSeite(ersteMapSeite)}>Maps 🗺</div>
    <div className="absolute top-[520px] pr-[0.6rem] bookmark-right bookmark-6 pointer-events-auto" onClick={() => geheZuSeite(letzteSeite)}>Timeline ⏳</div>
  </div>
)}

{/* 🔖 Timeline-Seite: Alle links */}
{aktiveSeite === letzteSeite && (
  <div className="absolute left-0 top-0 flex flex-col items-start pointer-events-none">
    <div className="absolute top-[120px] pl-[0.6rem] bookmark bookmark-1 pointer-events-auto" onClick={() => geheZuSeite(0)}>🧾 Inhalt</div>
    <div className="absolute top-[200px] pl-[0.6rem] bookmark bookmark-2 pointer-events-auto" onClick={() => geheZuSeite(letzteChronikSeite)}>📚 Chronik</div>
    <div className="absolute top-[280px] pl-[0.6rem] bookmark bookmark-3 pointer-events-auto" onClick={() => geheZuSeite(ersteSCSeite)}>🧙 SCs</div>
    <div className="absolute top-[360px] pl-[0.6rem] bookmark bookmark-4 pointer-events-auto" onClick={() => geheZuSeite(ersteNSCSeite)}>🧙 NSCs</div>
    <div className="absolute top-[440px] pl-[0.6rem] bookmark bookmark-5 pointer-events-auto" onClick={() => geheZuSeite(ersteMapSeite)}>🗺 Maps</div>
    <div className="absolute top-[520px] pl-[0.6rem] bookmark bookmark-6 pointer-events-auto" onClick={() => geheZuSeite(letzteSeite)}>⏳ Timeline</div>
  </div>
)}

{/* 🔖 Alle anderen Seiten (Chronik) → 2 links, 2 rechts */}
{aktiveSeite !== 0 && aktiveSeite !== letzteSeite && (
  <>
    <div className="absolute left-0 top-0 flex flex-col items-start pointer-events-none">
      <div className="absolute top-[120px] pl-[0.6rem] bookmark bookmark-1 pointer-events-auto" onClick={() => geheZuSeite(0)}>🧾 Inhalt</div>
      <div className="absolute top-[200px] pl-[0.6rem] bookmark bookmark-2 pointer-events-auto" onClick={() => geheZuSeite(letzteChronikSeite)}>📚 Chronik</div>
      <div className="absolute top-[280px] pl-[0.6rem] bookmark bookmark-3 pointer-events-auto" onClick={() => geheZuSeite(ersteSCSeite)}>🧙 SCs</div>
    </div>
    <div className="absolute right-0 top-0 flex flex-col items-end pointer-events-none">
      <div className="absolute top-[360px] pr-[0.6rem] bookmark-right bookmark-4 pointer-events-auto" onClick={() => geheZuSeite(ersteNSCSeite)}>NSCs 🧙</div>
      <div className="absolute top-[440px] pr-[0.6rem] bookmark-right bookmark-5 pointer-events-auto" onClick={() => geheZuSeite(ersteMapSeite)}>Maps 🗺</div>
      <div className="absolute top-[520px] pr-[0.6rem] bookmark-right bookmark-6 pointer-events-auto" onClick={() => geheZuSeite(letzteSeite)}>Timeline ⏳</div>
    </div>
  </>
)}


      {/* 🔍 Suchleiste über dem Buch */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="🔍 Suche nach Schlagwort, Ort, Kapitel ..."
          value={suchbegriff}
          onChange={(e) => setSuchbegriff(e.target.value)}
          className="w-[60%] px-4 py-2 rounded-lg border border-yellow-700 bg-[#2d2a24] text-yellow-300/80 placeholder-yellow-500/30 shadow-lg shadow-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-600 transition duration-300 font-serif"
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


      // if (entry.typ === 'map') {
      //     return (
      //       <>
      //         <div key={`${idx}-karte`} className="page">
      //           <MapPage mapId={entry.mapId} />
      //         </div>
      //         <div key={`${idx}-legende`} className="page">
      //           <LegendPage mapId={entry.mapId} />
      //         </div>
      //       </>
      //     )
      //   }



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
      ) : entry?.typ === 'nsc' || entry?.typ === 'sc' ? (
        <NSCPage
          ref={(el) => el && entry?.id && (pageRefs.current[entry.id] = el)}
          eintrag={entry}
          onNSCDelete={handleDeleteNSC}
          onNSCEdit={handleEditNSC}
          //LÖSCHEN
          // onDelete={async (id) => {
          //   if (!confirm('NSC wirklich löschen?')) return
          //   const { error } = await supabase.from('nscs').delete().eq('id', id)
          //   if (!error) fetchNSCs()
          // }}

        />
      ) : (
        <ChronikPage
        ref={(el) => el && entry?.id && (pageRefs.current[entry.id] = el)}
          entry={entry}
          idx={idx}
          visibleFlowIds={visibleFlowIds}
          toggleFlow={toggleFlow}
          handleEntryDelete={onDeleteChronikEntry}
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
          />
        
  </>
)
}