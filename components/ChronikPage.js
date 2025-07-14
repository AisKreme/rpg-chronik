import { supabase } from '../lib/supabaseClient'
import ImageUploader from './ImageUploader'
import NoFlip from './NoFlip'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ChronikPage = React.forwardRef(function ChronikPage(
  {
    entry,
    idx,
    visibleFlowIds,
    toggleFlow,
    handleEdit,
    handleEntryDelete,
    note,
    flow,
    kapitel,
    ort,
    tags,
    setNote,
    setFlow,
    setKapitel,
    setOrt,
    setTags,
    handleSubmit,
    editId,
    resetForm,
    className = '',
    isForm,
    images,
    setImages,
    onClose,
  },
  ref
) {
  const [selectedImage, setSelectedImage] = useState(null)
  

  return (
<div
  ref={ref}
  className={`page ${className} !w-auto flex flex-col justify-between px-4 relative`}
>
  {entry ? (
    <>
      {/* 🔘 Emoji-Buttons oben rechts */}
      <div className="absolute top-3 right-5 flex gap-3 z-10">
        <button
          onClick={() => toggleFlow(entry.id)}
          title="Klartext anzeigen/verbergen"
          className="hover:scale-110 transition-transform duration-200 text-yellow-500 text-lg"
        >
          📖
        </button>
        <button
          onClick={() => handleEdit(entry)}
          title="Bearbeiten"
          className="hover:scale-110 transition-transform duration-200 text-green-500 text-lg"
        >
          ✏️
        </button>
        <button
          onClick={() => handleEntryDelete(entry.id)}
          title="Löschen"
          className="hover:scale-110 transition-transform duration-200 text-red-500 text-lg"
        >
          🗑️
        </button>
      </div>

      <div>
        {/* <p className="text-xs text-yellow-600">ID: {entry.id}</p>*/}
        <h3 className="text-lg font-bold text-yellow-300">{entry.kapitel}</h3>
        <p className="text-sm text-yellow-500 mb-2">
        <span className="font-sans">
          {entry.date}
        </span>
        {" "}
        <span>
          - {entry.ort}
        </span>
        </p>
        {/* ✍️ Notiz */}
        <div className="max-h-[330px] overflow-y-auto pr-1 text-sm border border-yellow-700 rounded bg-[#fffaf0] text-black p-2 whitespace-pre-wrap font-sans">
          „{entry.note}“
        </div>

        {/* 📖 Klartext */}
        {visibleFlowIds.includes(entry.id) && (
          <div className="mt-3 text-black whitespace-pre-wrap text-sm max-h-40 overflow-y-auto pr-1 border border-yellow-700 bg-[#fffaf0] rounded p-2 font-sans">
            {entry.flow}
          </div>
        )}

        {/* 🖼️ Bilder */}
              {entry.images && entry.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {entry.images.map((imgPath, index) => (
                  <motion.img
                    key={index}
                    src={imgPath}
                    alt={`Bild ${index + 1}`}
                    onClick={() => setSelectedImage(imgPath)}
                    className="w-24 h-24 object-cover object-left-top rounded shadow border border-yellow-700 cursor-pointer hover:border-yellow-500"
                    whileHover={{ scale: 1.05, borderColor: "#facc15" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                ))}
          </div>
        )}
      </div>
    </>
  ) : (
    <div className="text-center text-sm italic text-yellow-500 mt-10">
      ❌ Kein Eintrag vorhanden.
    </div>
  )}

  {/* 📷 Bildvergrößerung */}
<AnimatePresence>
  {selectedImage && (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setSelectedImage(null)}
    >
      <motion.img
        src={selectedImage}
        className="max-w-[90%] max-h-[90%] border-4 border-yellow-700 rounded shadow-xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
      <button
        className="absolute top-4 right-4 text-yellow-200 bg-black/70 px-2 rounded"
        onClick={() => setSelectedImage(null)}
      >
        ❌
      </button>
    </motion.div>
  )}
</AnimatePresence>

  {/* 📄 Seitenzahl */}
  <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-yellow-600 font-sans tracking-wide select-none">
    Seite {idx + 1}
  </div>
</div>
  )
})

export default ChronikPage