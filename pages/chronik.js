import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import NavBar from '../components/NavBar'
import { useRouter } from 'next/router'


export default function Chronik() {
  const [note, setNote] = useState('')         // In-Character
  const [flow, setFlow] = useState('')         // Klartext
  const [kapitel, setKapitel] = useState('')
  const [ort, setOrt] = useState('')
  const [tags, setTags] = useState('')
  const [entries, setEntries] = useState([])
  const [visibleFlowIds, setVisibleFlowIds] = useState([]) // für einklappbare Klartexte
  const router = useRouter()
  const entryId = router.query.id
  const [editId, setEditId] = useState(null)  // merkt ID für Bearbeitung


  function handleEdit(entry) {
  setEditId(entry.id)
  setNote(entry.note || '')
  setFlow(entry.flow || '')
  setKapitel(entry.kapitel || '')
  setOrt(entry.ort || '')
  setTags(entry.tags?.join(', ') || '')
}

async function handleDelete(id) {
  if (confirm('Eintrag wirklich löschen?')) {
    const { error } = await supabase.from('chronik_entries').delete().eq('id', id)
    if (error) alert('Fehler beim Löschen: ' + error.message)
    else fetchEntries()
  }
}

  const handleSubmit = async (e) => {
  e.preventDefault()
  const heute = new Date().toISOString().slice(0, 10)

  if (editId) {
    const { error } = await supabase.from('chronik_entries').update({
      note, flow, kapitel, ort,
      tags: tags.split(',').map(t => t.trim()),
    }).eq('id', editId)

    if (error) alert('Fehler beim Aktualisieren: ' + error.message)
    else {
      alert('Eintrag aktualisiert!')
      resetForm()
    }
  } else {
    const { data, error } = await supabase.from('chronik_entries').insert({
      note, flow, kapitel, ort,
      tags: tags.split(',').map(t => t.trim()),
      images: [],
      date: heute,
    }).select('id').single()

    if (error) alert('Fehler: ' + error.message)
    else {
      alert('Eintrag gespeichert! ID: ' + data.id)
      resetForm()
    }
  }
}

  useEffect(() => {
    if (entryId) {
      fetchSingleEntry(entryId)
    } else {
      fetchEntries()
    }
  }, [entryId])

  async function fetchSingleEntry(id) {
    const { data, error } = await supabase.from('chronik_entries').select('*').eq('id', id).single()
    if (!error) setEntries([data])
  }

  async function fetchEntries() {
    const { data, error } = await supabase.from('chronik_entries').select('*').order('date', { ascending: true })
    if (!error) setEntries(data)
  }

  function toggleFlow(id) {
    setVisibleFlowIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
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

  return (
    <>
      <NavBar />
      <div className="max-w-3xl mx-auto p-6 font-serif">
        {!entryId && (
          <>
            <h1 className="text-2xl mb-4 text-ink">📝 Neuer Chronik-Eintrag</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="In-Character-Notiz" className="w-full p-2 border border-gray-400 rounded" rows={4} />
              <textarea value={flow} onChange={(e) => setFlow(e.target.value)} placeholder="Klartext (wird eingeklappt)" className="w-full p-2 border border-gray-400 rounded" rows={3} />
              <input value={kapitel} onChange={(e) => setKapitel(e.target.value)} placeholder="Kapitel" className="w-full p-2 border border-gray-400 rounded" />
              <input value={ort} onChange={(e) => setOrt(e.target.value)} placeholder="Ort" className="w-full p-2 border border-gray-400 rounded" />
              <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (kommagetrennt)" className="w-full p-2 border border-gray-400 rounded" />
              <button type="submit" className="bg-ink text-parchment px-4 py-2 rounded">
  {editId ? 'Änderungen speichern' : 'Speichern'}
</button>
{editId && (
  <button type="button" onClick={resetForm} className="ml-2 px-4 py-2 border rounded text-gray-600">
    Abbrechen
  </button>
)}
            </form>
          </>
        )}

        <hr className="my-8 border-ink" />
        <h2 className="text-xl mb-2 text-ink">📜 Gespeicherte Einträge</h2>
        <ul className="space-y-2">
          {entries.map(entry => (
            <li key={entry.id} className="p-3 border border-gray-400 rounded bg-white shadow-sm">
              <p className="text-sm text-gray-500">ID: {entry.id}</p>
              <p><strong>Datum:</strong> {entry.date}</p>
              <p><strong>Kapitel:</strong> {entry.kapitel}</p>
              <p><strong>Ort:</strong> {entry.ort}</p>
              <p><strong>Tags:</strong> {entry.tags?.join(', ')}</p>
              <p className="italic text-gray-700 mt-1">„{entry.note?.slice(0, 100)}…“</p>
              <button onClick={() => toggleFlow(entry.id)} className="text-sm text-blue-600 underline mt-2">
                {visibleFlowIds.includes(entry.id) ? 'Klartext verbergen' : 'Klartext anzeigen'}
              </button>
              {visibleFlowIds.includes(entry.id) && (
                <p className="mt-2 text-gray-800 whitespace-pre-line">{entry.flow}</p>
              )}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <button onClick={() => toggleFlow(entry.id)} className="text-sm text-blue-600 underline">
                      {visibleFlowIds.includes(entry.id) ? 'Klartext verbergen' : 'Klartext anzeigen'}
                    </button>
                    <button onClick={() => handleEdit(entry)} className="text-sm text-blue-600 underline">
                      🖊️ Bearbeiten
                    </button>
                    <button onClick={() => handleDelete(entry.id)} className="text-sm text-red-600 underline">
                      ❌ Löschen
                    </button>
                    <a href={`/chronik?id=${entry.id}`} className="text-sm text-blue-600 underline">
                      ➤ Anzeigen
                    </a>
                  </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}