import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'
import { saveChronikEntry, saveNSCEntry } from '../lib/saveHelpers'


export default function EntryPopup({
  show,
  onClose,
  entries,
  scrollToEntry,
  entryType,
  setEntryType,
  selectedNSC,
  setSelectedNSC,
  initialKapitel,
  setInitialKapitel,
  editId,
  editNSCId,
  refreshEntries,
  selectedMonster,
}) {

//NEU
const [note, setNote] = useState('')
const [flow, setFlow] = useState('')
const [kapitel, setKapitel] = useState('')
const [ort, setOrt] = useState('')
const [tags, setTags] = useState('')

const [name, setName] = useState('')
const [rolle, setRolle] = useState('')
const [info, setInfo] = useState('')

const [werte, setWerte] = useState('')
const [monsterOrt, setMonsterOrt] = useState('')

const [images, setImages] = useState([])

//NEU 
const isEditModeChronik = entryType === 'chronik' && !!editId
const isEditModeNSC = entryType === 'nsc' && !!editNSCId
const isEditModeMonster = entryType === 'monster' && !!selectedMonster
const isEditMode = isEditModeChronik || isEditModeNSC || isEditModeMonster


useEffect(() => {
  // 📝 Chronik-Eintrag bearbeiten
  if (entryType === 'chronik' && editId) {
    const eintrag = entries.find((e) => e.id === editId)
    if (eintrag) {
      setNote(eintrag.note || '')
      setFlow(eintrag.flow || '')
      setKapitel(eintrag.kapitel || '')
      setOrt(eintrag.ort || '')
      setTags(eintrag.tags?.join(', ') || '')
      setImages(eintrag.images || [])
    }
  }

  // 🧙 NSC bearbeiten
  else if (entryType === 'nsc' && selectedNSC) {
    setName(selectedNSC.name || '')
    setRolle(selectedNSC.rolle || '')
    setInfo(selectedNSC.info || '')
    setImages(selectedNSC.images || [])
  }

  // 🐲 Monster bearbeiten
  else if (entryType === 'monster' && selectedMonster) {
    setName(selectedMonster.name || '')
    setInfo(selectedMonster.beschreibung || '')
    setWerte(selectedMonster.werte || '')
    setMonsterOrt(selectedMonster.ort || '')
    setImages(selectedMonster.images || [])
  }

  // 📘 Standardkapitel setzen bei neuem Chronik-Eintrag
  if (entryType === 'chronik' && !editId && initialKapitel) {
    setKapitel(initialKapitel)
  }
}, [entryType, editId, selectedNSC, selectedMonster, entries, initialKapitel])


// 🗂 Welche Buckets für welchen Typ?
const bucketMap = {
  chronik: 'chronik-images',
  nsc: 'npcs',
  map: 'maps',
  monster: 'monsters'
}

// 🔁 Aktuellen Bucket auswählen
const selectedBucket = bucketMap[entryType]

const resolvedEntryId =
  entryType === 'nsc'
    ? editNSCId?.toString() || 'temp'
    : editId?.toString() || 'temp'


useEffect(() => {
  if (!show) return

  if (isEditModeChronik) {
    const eintrag = entries.find((e) => e.id === editId)
    if (eintrag) {
      setNote(eintrag.note || '')
      setFlow(eintrag.flow || '')
      setKapitel(eintrag.kapitel || '')
      setOrt(eintrag.ort || '')
      setTags(eintrag.tags?.join(', ') || '')
      setImages(eintrag.images || [])
    }
  } else if (isEditModeNSC && selectedNSC) {
    setName(selectedNSC.name || '')
    setRolle(selectedNSC.rolle || '')
    setInfo(selectedNSC.info || '')
    setImages(selectedNSC.images || [])
  } else if (entryType === 'monster' && selectedMonster) {
    setName(selectedMonster.name || '')
    setInfo(selectedMonster.beschreibung || '')
    setWerte(selectedMonster.werte || '')
    setMonsterOrt(selectedMonster.ort || '')
    setImages(selectedMonster.images || [])
  } else {
    resetFormLocal()
    if (entryType === 'chronik' && initialKapitel) {
      setKapitel(initialKapitel)
    }
  }
}, [
  show,
  entryType,
  editId,
  editNSCId,
  selectedNSC,
  selectedMonster,
  entries,
  initialKapitel,
])

const handleSave = async (e) => {
    e?.preventDefault()

    if (images.some((url) => url.startsWith('blob:'))) {
      alert('⚠️ Bitte warte, bis alle Bilder vollständig hochgeladen sind.')
      return
    }

    let newId = null
    if (entryType === 'chronik') {
      newId = await saveChronikEntry({ note, flow, kapitel, ort, tags, images, editId })
    } else if (entryType === 'nsc') {
      newId = await saveNSCEntry({ name, rolle, info, images, editNSCId })
    } else if (entryType === 'monster') {
        const { saveMonsterEntry } = await import('../lib/saveHelpers')
        newId = await saveMonsterEntry({
          name,
          beschreibung: info,
          werte,
          images,
          ort: monsterOrt,
          editMonsterId: selectedMonster?.id 
        })
      }

    if (!isEditModeChronik && !isEditModeNSC && newId) {
      scrollToEntry?.(newId)
    }
    console.log('💾 Final gespeicherte Bilder:', images)
    await refreshEntries?.()
    if (!isEditMode) setInitialKapitel?.('')
    resetFormLocal()
    onClose()
  }


  const handleTypeChange = (type) => {
  resetFormLocal() // Felder leeren
  setEntryType(type) // Typ neu setzen
}


function resetFormLocal(newId = null) {
  // Chronik-Felder
  setNote('')
  setFlow('')
  setKapitel('')
  setOrt('')
  setTags('')

  // NSC-Felder
  setName('')
  setRolle('')
  setInfo('')

  // Monster-Felder
  setWerte('')
  setMonsterOrt('')

  // Allgemeines
  setImages([])
  setSelectedNSC(null)
}


 return (
  <AnimatePresence>
    {show && (
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-[#2d2a24] border border-yellow-700 rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto shadow-xl text-parchment"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          {/* ✕ Schließen */}
          <button
            onClick={() => {
              resetFormLocal()
              onClose()
            }}
            className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-200 text-lg font-bold bg-transparent"
            title="Schließen"
          >
            ✕
          </button>

          {/* 📝 Titel */}
          <h2 className="text-xl font-bold mb-4">
            {isEditMode ? '✏️ Bearbeiten' : '🖋 Neuer Eintrag'}
          </h2>

          {/* 🧭 Umschalten */}
          {!isEditMode && (
            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('chronik')}
                className={`px-3 py-1 rounded ${
                  entryType === 'chronik'
                    ? 'bg-yellow-700 text-parchment'
                    : 'bg-[#3a362e] text-yellow-300 hover:bg-[#4a453c]'
                }`}
              >
                📖 Chronik
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('nsc')}
                className={`px-3 py-1 rounded ${
                  entryType === 'nsc'
                    ? 'bg-yellow-700 text-parchment'
                    : 'bg-[#3a362e] text-yellow-300 hover:bg-[#4a453c]'
                }`}
              >
                🧙 NSC
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('monster')}
                className={`px-3 py-1 rounded ${
                  entryType === 'monster'
                    ? 'bg-yellow-700 text-parchment'
                    : 'bg-[#3a362e] text-yellow-300 hover:bg-[#4a453c]'
                }`}
              >
                👹 Monster
              </button>
            </div>
            
          )}

          {/* 📖 Chronik-Formular */}
          {entryType === 'chronik' ? (
            <form onSubmit={handleSave} className="space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Notiz (in-character)"
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <textarea
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
                placeholder="Klartext"
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <input
                value={kapitel}
                onChange={(e) => setKapitel(e.target.value)}
                placeholder="Kapitel"
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <input
                value={ort}
                onChange={(e) => setOrt(e.target.value)}
                placeholder="Ort"
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Tags (kommagetrennt)"
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />

              {/* 📸 Bild-Upload Chronik */}
              <ImageUploader
                entryId={resolvedEntryId}
                bucket={selectedBucket}
                initialImages={images}
                onUploadComplete={setImages}
              />


              <div className="flex gap-2">
                <button type="submit" className="magical-btn bg-green-900 hover:bg-green-800 w-full">
                  {isEditModeChronik ? '💾 Ändern' : '➕ Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFormLocal()
                    onClose()
                  }}
                  className="border px-4 py-1 text-gray-700 rounded bg-white"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : entryType === 'nsc' ? (
            /* 👤 NSC-Formular */
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <input
                type="text"
                placeholder="Rolle"
                value={rolle}
                onChange={(e) => setRolle(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <textarea
                placeholder="Beschreibung"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />

              {/* 📸 Bild-Upload NSC */}
              <ImageUploader
                entryId={resolvedEntryId}
                bucket={selectedBucket}
                initialImages={images}
                onUploadComplete={setImages}
              />

              <div className="flex gap-2">
                <button type="submit" className="magical-btn bg-green-900 hover:bg-green-800 w-full">
                  {isEditModeNSC ? '💾 NSC aktualisieren' : '➕ NSC speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFormLocal()
                    onClose()
                  }}
                  className="border px-4 py-1 text-gray-700 rounded bg-white"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          ) : (
            /* 👹 Monster-Formular */
            <form onSubmit={handleSave} className="space-y-3">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <textarea
                placeholder="Beschreibung"
                value={info}
                onChange={(e) => setInfo(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <textarea
                placeholder="Werte"
                value={werte}
                onChange={(e) => setWerte(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />
              <input
                type="text"
                placeholder="Ort"
                value={monsterOrt}
                onChange={(e) => setMonsterOrt(e.target.value)}
                className="w-full p-2 rounded border border-yellow-700 text-black font-sans"
              />

              <ImageUploader
                entryId={resolvedEntryId}
                bucket={selectedBucket}
                initialImages={images}
                onUploadComplete={setImages}
              />

              <div className="flex gap-2">
                <button type="submit" className="magical-btn bg-green-900 hover:bg-green-800 w-full">
                  {isEditModeMonster ? '💾 Monster aktualisieren' : '➕ Monster speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetFormLocal()
                    onClose()
                  }}
                  className="border px-4 py-1 text-gray-700 rounded bg-white"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)
}