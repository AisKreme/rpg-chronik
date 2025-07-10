// pages/chronik.js

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import ChronikPage from '../components/ChronikPage'
import HTMLFlipBook from 'react-pageflip'
import EntryPopup from '../components/EntryPopup'


export default function Chronik() {
  const [note, setNote] = useState('')
  const [flow, setFlow] = useState('')
  const [kapitel, setKapitel] = useState('')
  const [ort, setOrt] = useState('')
  const [tags, setTags] = useState('')
  const [entries, setEntries] = useState([])
  const [visibleFlowIds, setVisibleFlowIds] = useState([])
  const [editId, setEditId] = useState(null)
  const [showPopup, setShowPopup] = useState(false) 
  const bookRef = useRef(null)
  const [images, setImages] = useState([])

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

return (
  <>
    <NavBar />

      <div className="flex justify-center mt-10">
        <div className="w-[900px] mx-auto bg-[#1c1b18] border border-yellow-700 rounded-lg p-4 shadow-xl">
        <HTMLFlipBook
           width={420}
            height={550}
            size="fixed"
            minWidth={420}
            maxWidth={840}
            minHeight={550}
            maxHeight={1100}
            showCover={false}
            drawShadow={true}
            ref={bookRef}
            useMouseEvents={false}
            mobileScrollSupport={false}
            className="flipbook"
          >
          {entries.map((entry, idx) => (
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

        {/* 📖 Navigationsleiste unter dem Flipbook */}
        <div className="mt-4 flex justify-between items-center px-8">
          <button onClick={goPrev} className="magical-btn">⬅ Zurück</button>
          <button onClick={() => setShowPopup(true)} className="magical-btn bg-green-900 hover:bg-green-800">
            ✨ + Eintrag
          </button>
          <button onClick={goNext} className="magical-btn">Weiter ➡</button>
        </div>
      </div>
    </div>

    {/* Pop-up für neuen oder bearbeiteten Eintrag */}
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