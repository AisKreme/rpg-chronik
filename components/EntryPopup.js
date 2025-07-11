import { motion, AnimatePresence } from 'framer-motion'
import ChronikPage from './ChronikPage'
import React, { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'

export default function EntryPopup({
  show,
  onClose,
  handleSubmit,
  note,
  setNote,
  flow,
  setFlow,
  kapitel,
  setKapitel,
  ort,
  setOrt,
  tags,
  setTags,
  visibleFlowIds,
  toggleFlow,
  handleEdit,
  handleDelete,
  editId,
  resetForm,
  entries,
  images,
  setImages,
  entryType,
  setEntryType,
  selectedNSC,
  setSelectedNSC,
  name,
  setName,
  rolle,
  setRolle,
  info,
  setInfo,
  handleNSCSubmit,
  editNSCId,
  scrollToEntry,
}) {
  // NSC-Daten vorbereiten beim Bearbeiten
  useEffect(() => {
    if (entryType === 'nsc' && selectedNSC) {
      setName(selectedNSC.name || '')
      setRolle(selectedNSC.rolle || '')
      setInfo(selectedNSC.info || '')
      setImages(selectedNSC.images || [])
    }
  }, [entryType, selectedNSC])


  // Eintrag speichern je nach Typ
  const handleSave = async (e) => {
    e?.preventDefault()
    let newId = null
    if (entryType === 'chronik') {
      newId = await handleSubmit(e)
    } else if (entryType === 'nsc') {
      newId = await handleNSCSubmit()
    }
    resetForm(newId)
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
            <button
              onClick={() => {
                resetForm()
                onClose()
            }}
              className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-200 text-lg font-bold bg-transparent"
              title="Schließen"
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">
              {editId || editNSCId ? '✏️ Bearbeiten' : '🖋 Neuer Eintrag'}
            </h2>

            <div className="mb-4 flex gap-2">
              <button
                type="button"
                onClick={() => setEntryType('chronik')}
                className={`px-3 py-1 rounded ${entryType === 'chronik'
                  ? 'bg-yellow-700 text-parchment'
                  : 'bg-[#3a362e] text-yellow-300 hover:bg-[#4a453c]'}`}
              >
                📖 Chronik
              </button>
              <button
                type="button"
                onClick={() => setEntryType('nsc')}
                className={`px-3 py-1 rounded ${entryType === 'nsc'
                  ? 'bg-yellow-700 text-parchment'
                  : 'bg-[#3a362e] text-yellow-300 hover:bg-[#4a453c]'}`}
              >
                🧙 NSC
              </button>
            </div>

            {entryType === 'chronik' ? (
              <ChronikPage
                entry={editId ? entries.find((e) => e.id === editId) : null}
                isForm={true}
                visibleFlowIds={visibleFlowIds}
                toggleFlow={toggleFlow}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleSubmit={handleSave}
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
                images={images}
                setImages={setImages}
                resetForm={resetForm}
                onClose={onClose}
              />
            ) : (
              <form onSubmit={handleSave} className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 rounded border border-yellow-700 text-black"
                />
                <input
                  type="text"
                  placeholder="Rolle"
                  value={rolle}
                  onChange={(e) => setRolle(e.target.value)}
                  className="w-full p-2 rounded border border-yellow-700 text-black"
                />
                <textarea
                  placeholder="Beschreibung"
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  className="w-full p-2 rounded border border-yellow-700 text-black"
                />
                <ImageUploader
                  entryId={editNSCId ? editNSCId.toString() : 'temp'}
                  bucket="npcs"
                  initialImages={images}
                  onUploadComplete={(newImages) => setImages(newImages)}
                />
                <button className="magical-btn bg-green-900 hover:bg-green-800 w-full"
                onClick={() => {
                resetForm()
                onClose()
              }}>
                  {editNSCId ? '💾 NSC aktualisieren' : '➕ NSC speichern'}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}