// pages/chronik.js

import { useState, useEffect, useRef } from 'react'
import { supabase, supabaseUrl } from '../lib/supabaseClient'
import ChronikPage from '../components/ChronikPage'
import HTMLFlipBook from 'react-pageflip'
import EntryPopup from '../components/EntryPopup'
import Inhaltsverzeichnis from '../components/Inhaltsverzeichnis'
import TimelinePage from '../components/TimelinePage'
import NSCPage from './nscs'


export default function Chronik() {
// 📋 State-Variablen für Eintragsdaten
  const [note, setNote] = useState('')
  const [flow, setFlow] = useState('')
  const [kapitel, setKapitel] = useState('')
  const [ort, setOrt] = useState('')
  const [tags, setTags] = useState('')

  // 📋 Allgemeine Zustände
  const [entries, setEntries] = useState([])
  const [visibleFlowIds, setVisibleFlowIds] = useState([])
  const [editId, setEditId] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [suchbegriff, setSuchbegriff] = useState('')
  const bookRef = useRef(null)
  const [aktiveSeite, setAktiveSeite] = useState(0)

  // 🔍 Gefilterte Einträge (Suche)
  const gefilterteEintraege = entries.filter(entry => {
    const text = `${entry.note} ${entry.flow} ${entry.kapitel} ${entry.ort} ${(entry.tags || []).join(' ')}`
    return text.toLowerCase().includes(suchbegriff.toLowerCase())
  })

  const [nscs, setNSCs] = useState([])
    const [entryType, setEntryType] = useState('chronik') // Standard: Chronik-Eintrag
    const [selectedNSC, setSelectedNSC] = useState(null)

    const [name, setName] = useState('')
    const [rolle, setRolle] = useState('')
    const [info, setInfo] = useState('')
    const [editNSCId, setEditNSCId] = useState(null)
    const [images, setImages] = useState([])

    useEffect(() => {
      fetchEntries()
      fetchNSCs()
    }, [])

    async function fetchNSCs() {
      const { data, error } = await supabase
        .from('nscs')
        .select('id, name, rolle, info, images')
        .order('created_at', { ascending: true })
      if (!error) setNSCs(data)
    }

const handleNSCSubmit = async () => {
  console.log('🧪 [handleNSCSubmit STARTED]');
  console.log('📝 Eingabedaten:', { editNSCId, name, rolle, info, images });

  // 🔁 Bestehenden NSC aktualisieren
  if (editNSCId) {
    console.log('✏️ Versuche Update für ID:', editNSCId);
    const { error } = await supabase
      .from('nscs')
      .update({ name, rolle, info, images })
      .eq('id', editNSCId);
      

    if (error) {
      console.error('❌ Fehler beim Aktualisieren:', error.message);
      alert('Fehler beim Aktualisieren: ' + error.message);
    } else {
      console.log('✅ Update erfolgreich für NSC-ID:', editNSCId);
      resetForm();
    }
    return;
  }

  // ➕ Neuer NSC wird erstellt
  console.log('➕ Neuer NSC wird erstellt...');
  const insertPayload = { name, rolle, info };
  console.log('📦 Insert-Daten:', insertPayload);

  const { data, error } = await supabase
    .from('nscs')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error) {
    console.error('❌ Fehler beim INSERT:', error.message);
    alert('Fehler beim Erstellen: ' + error.message);
    return;
  }

  console.log('✅ NSC erstellt mit ID:', data.id);
  const newId = data.id.toString();

  // 📦 Bilder verschieben aus temp in npcs/<newId>
  console.log('📂 Verschiebe Bilder nach Ordner npcs/' + newId);
  const movedImages = await moveImagesToFinalFolder(images, newId, 'npcs');
  console.log('📦 Neue Bildpfade:', movedImages);

  // 🔄 Bilder im NSC-Eintrag nachträglich speichern
  const { error: updateError } = await supabase
    .from('nscs')
    .update({ images: movedImages })
    .eq('id', newId);

  if (updateError) {
    console.error('❌ Fehler beim Bild-Update:', updateError.message);
    alert('Fehler beim Hinzufügen der Bilder: ' + updateError.message);
    return;
  }

  console.log('✅ Bilder aktualisiert für NSC-ID:', newId);
  if (fetchNSCs) await fetchNSCs()
  if (scrollToEntry) scrollToEntry(newId)

  // 🧹 Formular zurücksetzen
  setEditNSCId(null);
  setImages([]);
  resetForm();
  console.log('🎉 Vorgang abgeschlossen – NSC gespeichert');
};

  useEffect(() => {
    fetchEntries()
  }, [])

  async function fetchEntries() {
    const { data, error } = await supabase
      .from('chronik_entries')
      .select('*')
      .order('id', { ascending: true })

    if (!error) setEntries(data)
  }

function resetForm(newId = null) {
  // Chronik-Felder
  setNote('')
  setFlow('')
  setKapitel('')
  setOrt('')
  setTags('')
  setEditId(null)

  // NSC-Felder
  setName('')
  setRolle('')
  setInfo('')
  setEditNSCId?.(null)
  setSelectedNSC(null)

  // Allgemeines
  setImages([])
  setEntryType('chronik')

  // Optionales Scrollen
  if (newId) {
    scrollToEntry?.(newId)
  }

  // Nachladen
  fetchEntries?.()
  fetchNSCs?.()
}


function handleEdit(entry) {
  setEditId(entry.id)
  setNote(entry.note || '')
  setFlow(entry.flow || '')
  setKapitel(entry.kapitel || '')
  setOrt(entry.ort || '')
  setTags(entry.tags?.join(', ') || '')
  setShowPopup(true)
}


function openNewEntryPopup(type = 'chronik') {
  setEntryType(type)
  if (type === 'chronik' && !editId) {
    const letztesKapitel = entries[entries.length - 1]?.kapitel || ''
    setKapitel(letztesKapitel)
  }
  setSelectedNSC(null)
  setShowPopup(true)
}


  async function handleDelete(id) {
    if (!confirm('Eintrag wirklich löschen?')) return

    const { data: entry } = await supabase
      .from('chronik_entries')
      .select('images')
      .eq('id', id)
      .single()

    if (entry?.images?.length > 0) {
      const filePaths = entry.images.map((url) =>
        url.split('/storage/v1/object/public/')[1]
      )

      const { error: storageError } = await supabase.storage
        .from('chronik')
        .remove(filePaths)

      if (storageError) {
        alert('Fehler beim Löschen der Bilder: ' + storageError.message)
        return
      }
    }

    const { error } = await supabase.from('chronik_entries').delete().eq('id', id)
    if (error) {
      alert('Fehler beim Löschen des Eintrags: ' + error.message)
    } else {
      fetchEntries()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const heute = new Date().toLocaleDateString('de-DE')

    const payload = {
      note,
      flow,
      kapitel,
      ort,
      tags: tags.split(',').map((t) => t.trim()),
      date: heute,
    }

    if (editId) {
      const { error } = await supabase
        .from('chronik_entries')
        .update(payload)
        .eq('id', editId)

      if (error) alert('Fehler beim Aktualisieren: ' + error.message)
      else {
        resetForm()
      }
    } else {
      const { data, error } = await supabase
        .from('chronik_entries')
        .insert(payload)
        .select('id')
        .single()

        
      if (error) alert('Fehler: ' + error.message)
      else {
        resetForm()
      }
    }
  }

  function toggleFlow(id) {
    setVisibleFlowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function moveImagesToFinalFolder(images, newId, bucket) {
  const movedUrls = []

  for (const url of images) {
    if (!url.includes('/temp/')) {
      movedUrls.push(url)
      continue
    }

    const oldPath = url.split('/storage/v1/object/public/')[1]
    const filename = oldPath.split('/').pop()
    const newPath = `${newId}/${filename}`

    const { error: copyError } = await supabase
      .storage
      .from(bucket)
      .copy(oldPath, newPath)

    if (copyError) {
      console.error('Fehler beim Kopieren:', copyError)
      continue
    }

    await supabase.storage.from(bucket).remove([oldPath])

   const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${newPath}`
    movedUrls.push(publicUrl)
  }

  return movedUrls
}

  // 📖 Seitenaufbau vorbereiten – inklusive Inhaltsverzeichnis und Timeline
  const pages = []

  // ➤ Seite 0: Inhaltsverzeichnis (rechte Einzelseite)
  pages.push({ id: 'inhalt', note: '📖 Inhaltsverzeichnis', flow: '', ort: '', kapitel: '', tags: [] })

  // ➤ Hauptseiten: Chronik-Einträge
    pages.push(...gefilterteEintraege.map(e => ({ ...e, typ: 'chronik' })))

    // ➤ NSCs als Seiten danach
    // ➤ NSCs in Gruppen zu je 2 verpacken
      const nscGroups = []
      for (let i = 0; i < nscs.length; i += 2) {
        nscGroups.push(nscs.slice(i, i + 2))
      }

      // ➤ Jede Gruppe wird eine Seite im Flipbook
      pages.push(...nscGroups.map((gruppe, index) => ({
        id: `nsc-page-${index}`,
        typ: 'nsc',
        gruppe
      })))

    const ersteNSCSeite = pages.findIndex(p => p?.typ === 'nsc')

  // ➤ ggf. Leerseite einfügen, damit Timeline auf linker Seite erscheint
  const totalWithoutTimeline = pages.length
  const needsEmptyPageBeforeTimeline = totalWithoutTimeline % 2 === 0
  if (needsEmptyPageBeforeTimeline) pages.push(null)

  // ➤ Letzte Seite: Timeline (linke Einzelseite / Rückseite)
  pages.push({ id: 'timeline', note: '📅 Timeline', flow: '', ort: '', kapitel: '', tags: [] })


  //Bookmarks + Helper
      const letzteSeite = pages.length - 1 // Timeline ist letzte Seite
      const letzteChronikSeite = pages.findIndex(p => p?.id === entries.at(-1)?.id)

      // ➤ Jetzt Mapping aufbauen
        const seitenIndexMap = new Map()
        pages.forEach((entry, i) => {
          if (entry && entry.id && entry.id !== 'inhalt' && entry.id !== 'timeline') {
            seitenIndexMap.set(entry.id, i)
          }
        })
    const scrollToEntry = (id) => {
  const index = entries.findIndex((e) => e.id === id)
  if (index === -1) return
  const page = index % 2 === 0 ? index : index - 1
  setTimeout(() => {
    bookRef.current?.pageFlip().flip(page)
  }, 200)
}
    function geheZuSeite(nr) {
      bookRef.current?.pageFlip().flip(nr)
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

return (
  <>
      <div className="flex justify-center items-center min-h-screen bg-[#1c1b18]">
  <div className="relative w-[900px] bg-[#1c1b18] border border-yellow-700 rounded-lg p-4 shadow-xl">
          {/* 📖 Linke oder Rechte Bookmarks je nach Seite */}
            {/* 🔖 Inhaltsseite: Alle rechts */}
{aktiveSeite === 0 && (
  <div className="absolute right-0 top-0 flex flex-col items-end pointer-events-none">
    <div className="absolute top-[120px] pr-[0.6rem] bookmark-right bookmark-1 pointer-events-auto" onClick={() => geheZuSeite(0)}>Inhalt 🧾</div>
    <div className="absolute top-[210px] pr-[0.6rem] bookmark-right bookmark-2 pointer-events-auto" onClick={() => geheZuSeite(letzteChronikSeite)}>Chronik 📚</div>
    <div className="absolute top-[300px] pr-[0.6rem] bookmark-right bookmark-3 pointer-events-auto" onClick={() => geheZuSeite(ersteNSCSeite)}>NSCs 🧙</div>
    <div className="absolute top-[390px] pr-[0.6rem] bookmark-right bookmark-4 pointer-events-auto" onClick={() => geheZuSeite(letzteSeite)}>Timeline ⏳</div>
  </div>
)}

{/* 🔖 Timeline-Seite: Alle links */}
{aktiveSeite === letzteSeite && (
  <div className="absolute left-0 top-0 flex flex-col items-start pointer-events-none">
    <div className="absolute top-[120px] pl-[0.6rem] bookmark bookmark-1 pointer-events-auto" onClick={() => geheZuSeite(0)}>🧾 Inhalt</div>
    <div className="absolute top-[210px] pl-[0.6rem] bookmark bookmark-2 pointer-events-auto" onClick={() => geheZuSeite(letzteChronikSeite)}>📚 Chronik</div>
    <div className="absolute top-[300px] pl-[0.6rem] bookmark bookmark-3 pointer-events-auto" onClick={() => geheZuSeite(ersteNSCSeite)}>🧙 NSCs</div>
    <div className="absolute top-[390px] pl-[0.6rem] bookmark bookmark-4 pointer-events-auto" onClick={() => geheZuSeite(letzteSeite)}>⏳ Timeline</div>
  </div>
)}

{/* 🔖 Alle anderen Seiten (Chronik) → 2 links, 2 rechts */}
{aktiveSeite !== 0 && aktiveSeite !== letzteSeite && (
  <>
    <div className="absolute left-0 top-0 flex flex-col items-start pointer-events-none">
      <div className="absolute top-[120px] pl-[0.6rem] bookmark bookmark-1 pointer-events-auto" onClick={() => geheZuSeite(0)}>🧾 Inhalt</div>
      <div className="absolute top-[210px] pl-[0.6rem] bookmark bookmark-2 pointer-events-auto" onClick={() => geheZuSeite(letzteChronikSeite)}>📚 Chronik</div>
    </div>
    <div className="absolute right-0 top-0 flex flex-col items-end pointer-events-none">
      <div className="absolute top-[300px] pr-[0.6rem] bookmark-right bookmark-3 pointer-events-auto" onClick={() => geheZuSeite(ersteNSCSeite)}>NSCs 🧙</div>
      <div className="absolute top-[390px] pr-[0.6rem] bookmark-right bookmark-4 pointer-events-auto" onClick={() => geheZuSeite(letzteSeite)}>Timeline ⏳</div>
    </div>
  </>
)}


        {/* 🔍 Suchleiste über dem Buch */}
        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="🔍 Suche nach Schlagwort, Ort, Kapitel ..."
            value={suchbegriff}
            onChange={(e) => setSuchbegriff(e.target.value)}
            className="w-[60%] px-4 py-2 rounded border border-yellow-700 text-black shadow"
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

    {pages.map((entry, idx) => (
  <div key={idx} className="pointer-events-auto">
    {entry?.id === 'inhalt' ? (
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
    ) : entry?.typ === 'nsc' ? (
      <NSCPage
        nscs={entry.gruppe}
        onEdit={(nsc) => {
          setSelectedNSC(nsc)
          setEditNSCId(nsc.id?.toString())
          setName(nsc.name)
          setRolle(nsc.rolle)
          setInfo(nsc.info)
          setImages(nsc.images || [])
          setEntryType('nsc')
          setShowPopup(true)
        }}
        onDelete={async (id) => {
          if (!confirm('NSC wirklich löschen?')) return
          const { error } = await supabase.from('nscs').delete().eq('id', id)
          if (!error) fetchNSCs()
        }}
      />
    ) : (
      <ChronikPage
        entry={entry}
        idx={idx}
        visibleFlowIds={visibleFlowIds}
        toggleFlow={toggleFlow}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        handleSubmit={handleSubmit}
        note={note}
        setNote={setNote}
        flow={flow}
        setFlow={setFlow}
        kapitel={kapitel}
        setKapitel={setKapitel}
        ort={ort}
        setOrt={setOrt}
        tags={tags}
        setTags={setTags}
        editId={editId}
        resetForm={resetForm}
      />
    )}
  </div>
))}
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
          }}
          handleSubmit={handleSubmit}
          note={note}
          setNote={setNote}
          flow={flow}
          setFlow={setFlow}
          kapitel={kapitel}
          setKapitel={setKapitel}
          ort={ort}
          setOrt={setOrt}
          tags={tags}
          setTags={setTags}
          visibleFlowIds={visibleFlowIds}
          toggleFlow={toggleFlow}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          editId={editId}
          entries={entries}
          resetForm={resetForm}
          entryType={entryType}
          setEntryType={setEntryType}
          selectedNSC={selectedNSC}
          setSelectedNSC={setSelectedNSC}
          name={name}
          setName={setName}
          rolle={rolle}
          setRolle={setRolle}
          info={info}
          setInfo={setInfo}
          handleNSCSubmit={handleNSCSubmit}
          editNSCId={editNSCId}
          images={images}
          setImages={setImages}
          scrollToEntry={scrollToEntry}
        />
  </>
)
}