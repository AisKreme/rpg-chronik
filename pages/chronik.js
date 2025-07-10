// pages/chronik.js

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import ChronikPage from '../components/ChronikPage'
import HTMLFlipBook from 'react-pageflip'
import EntryPopup from '../components/EntryPopup'
import Inhaltsverzeichnis from '../components/Inhaltsverzeichnis'



export default function Chronik() {
// 📋 State-Variablen für Eintragsdaten
  const [note, setNote] = useState('')
  const [flow, setFlow] = useState('')
  const [kapitel, setKapitel] = useState('')
  const [ort, setOrt] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState([])

  // 📋 Allgemeine Zustände
  const [entries, setEntries] = useState([])
  const [visibleFlowIds, setVisibleFlowIds] = useState([])
  const [editId, setEditId] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [suchbegriff, setSuchbegriff] = useState('')
  const bookRef = useRef(null)

  // 🔍 Gefilterte Einträge (Suche)
  const gefilterteEintraege = entries.filter(entry => {
    const text = `${entry.note} ${entry.flow} ${entry.kapitel} ${entry.ort} ${(entry.tags || []).join(' ')}`
    return text.toLowerCase().includes(suchbegriff.toLowerCase())
  })

  // 📄 Seitenaufbau vorbereiten (Inhaltsverzeichnis = Seite 0)
  const seitenIndexMap = new Map()
  let pageCounter = 1 // Seite 0 ist Inhaltsverzeichnis

  gefilterteEintraege.forEach((entry) => {
    seitenIndexMap.set(entry.id, pageCounter)
    pageCounter++
  })

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

  function resetForm() {
    setNote('')
    setFlow('')
    setKapitel('')
    setOrt('')
    setTags('')
    setEditId(null)
    fetchEntries()
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
      images: images
    }

    if (editId) {
      const { error } = await supabase
        .from('chronik_entries')
        .update(payload)
        .eq('id', editId)

      if (error) alert('Fehler beim Aktualisieren: ' + error.message)
      else {
        alert('Eintrag aktualisiert!')
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
        alert('Eintrag gespeichert! ID: ' + data.id)
        resetForm()
      }
    }
  }

  function toggleFlow(id) {
    setVisibleFlowIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  // Seiten vorbereiten
  const pages = [...entries]
  const needsPadding = pages.length % 2 === 0
  pages.push(null) // Eingabeformular auf neuer Seite
  if (!needsPadding) pages.push(null) // auf rechter Seite enden

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
        {/* 📖 Linke Bookmarks */}
          <div className="absolute left-0 top-[20%] flex flex-col gap-6">
            <div className="bookmark bookmark-1" onClick={() => console.log('Inhalt')}>Inhalt</div>
            <div className="bookmark bookmark-2" onClick={() => console.log('Chronik')}>Chronik</div>
          </div>

          {/* 📖 Rechte Bookmarks */}
          <div className="absolute right-0 top-[50%] flex flex-col gap-6 items-end">
            <div className="bookmark-right bookmark-3" onClick={() => window.location.href = '/nscs.html'}>🧙 NSCs</div>
            <div className="bookmark-right bookmark-4" onClick={() => console.log('Timeline')}>Timeline</div>
          </div> 


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
    >
    <div>
      {/* Inhaltsverzeichnis-Seite */}
       <Inhaltsverzeichnis
        entries={gefilterteEintraege}
        seitenMap={seitenIndexMap}
        goToPage={(n) => bookRef.current?.pageFlip().flip(n)}

      />
    </div>
    
      {gefilterteEintraege.map((entry, idx) => (
        <div key={idx} className="pointer-events-auto">
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
        </div>
      ))}
    </HTMLFlipBook>

    {/* 🔘 Navigationsleiste Unten*/}
    <div className="mt-4 flex justify-between items-center px-8">
      <button onClick={goPrev} className="magical-btn">⬅ Zurück</button>
      <button
        onClick={() => setShowPopup(true)}
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
            resetForm()
            setImages([])
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
          images={images}
          setImages={setImages}
          resetForm={resetForm}
        />
  </>
)
}