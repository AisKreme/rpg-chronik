import { motion, AnimatePresence } from 'framer-motion'
import ChronikPage from './ChronikPage'
import React, { useState, useEffect } from 'react'

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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}