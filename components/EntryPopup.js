import { motion, AnimatePresence } from 'framer-motion'
import ChronikPage from './ChronikPage'
import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
    resetNSCForm,
}) {

// Wenn Eintrag gewechselt wird (z. B. Bearbeiten), Bilder neu setzen
useEffect(() => {
  if (editId) {
    const found = entries.find((e) => e.id === editId)
    if (found) {
      setImages(found.images || [])
    }
  } else {
    setImages([])
  }
}, [editId, entries])
  

useEffect(() => {
  if (entryType === 'nsc' && selectedNSC) {
    setName(selectedNSC.name || '')
    setRolle(selectedNSC.rolle || '')
    setInfo(selectedNSC.info || '')
  }
}, [entryType, selectedNSC])


        async function handleImageUpload(e) {
        const file = e.target.files[0]
        if (!file) return

        const fileName = `${Date.now()}_${file.name}`
        const { data, error } = await supabase.storage
            .from('chronik')
            .upload(`temp/${fileName}`, file)

        if (error) {
            alert('Fehler beim Hochladen: ' + error.message)
            return
        }

        const publicUrl = supabase.storage
            .from('chronik')
            .getPublicUrl(`temp/${fileName}`).data.publicUrl

        setImages((prev) => [...prev, publicUrl])
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
            {/* ❌ Schließen-Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-200 text-lg font-bold bg-transparent"
              title="Schließen"
            >
              ✕
            </button>

           <h2 className="text-xl font-bold mb-4">
                {editId ? '✏️ Eintrag bearbeiten' : '🖋 Neuer Eintrag'}
           </h2>


            <div className="mb-4 flex gap-2">
            <button
                type="button"
                onClick={() => setEntryType('chronik')}
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
                onClick={() => setEntryType('nsc')}
                className={`px-3 py-1 rounded ${
                entryType === 'nsc'
                    ? 'bg-yellow-700 text-parchment'
                    : 'bg-[#3a362e] text-yellow-300 hover:bg-[#4a453c]'
                }`}
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
                    handleSubmit={(e) => {
                    handleSubmit(e)
                    onClose()
                    }}
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
                    resetForm={() => {
                    resetForm()
                    onClose()
                    }}
                />
                ) : (
                <form
  onSubmit={(e) => {
    handleNSCSubmit(e)
    onClose()
  }}
  className="space-y-3"
>
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

  {/* 📸 Bild-Upload */}
        <div className="mb-4">
            <label className="text-sm text-yellow-300 mb-1 block">📸 Bilder:</label>
            {images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
                {images.map((img, i) => (
                <div key={i} className="relative">
                    <img src={img} className="h-20 w-20 object-cover rounded" />
                    <button
                    type="button"
                    onClick={() => {
                        const updated = [...images]
                        updated.splice(i, 1)
                        setImages(updated)
                    }}
                    className="absolute top-0 right-0 text-red-500 bg-black/70 rounded-full px-1"
                    >
                    ❌
                    </button>
                </div>
                ))}
            </div>
            )}
         <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e)}
            className="text-sm text-yellow-200"
        />
        </div>

  <button className="magical-btn bg-green-900 hover:bg-green-800 w-full">
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