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
    className = '',
  },
  ref
) {
  const [selectedImage, setSelectedImage] = useState(null)


const flowVisible = !!entry?.id && (visibleFlowIds || []).includes(entry.id)

  return (
  <div
    ref={ref}
    className={`relative w-[420px] h-[530px] border border-yellow-700 bg-[#1a1e24] text-parchment shadow-xl page ${
      flowVisible ? 'overflow-y-auto' : 'overflow-hidden'
    }`}
    data-entry-id={entry?.id}
  >
    {entry ? (
      <div className="flex flex-col h-full justify-between">
        {/* 🔘 Buttons */}
        <div className="absolute top-3 right-5 flex gap-3 z-10">
          <button onClick={() => toggleFlow(entry.id)} title="Klartext" className="hover:scale-110 text-yellow-500">📖</button>
          <button onClick={() => handleEdit(entry)} title="Bearbeiten" className="hover:scale-110 text-green-500">✏️</button>
          <button onClick={() => handleEntryDelete(entry)} title="Löschen" className="hover:scale-110 text-red-500">🗑️</button>
        </div>

        {/* 🧭 Kapitel, Datum, Ort */}
        <div>
          <h3 className="text-lg font-bold text-yellow-300">{entry.kapitel}</h3>
          <p className="text-sm text-yellow-500 font-sans mt-1 mb-2">
            {entry.date} – {entry.ort}
          </p>
        </div>

        {/* 📝 Notizblock */}
      <div
        className={`text-sm font-sans text-yellow-100 whitespace-pre-wrap border border-yellow-800 rounded px-2 py-1 ${
          flowVisible ? '' : 'overflow-y-auto max-h-[340px]'
        }`}
      >
        {entry.note}
      </div>

        {/* 🔽 Klartext */}
          <div
        className={`mt-2 text-sm font-sans text-yellow-400 whitespace-pre-wrap`}
        style={{ display: flowVisible ? 'block' : 'none' }}
        data-flow
      >
        {entry.flow}
      </div>

        {/* 🖼 Bilder */}
        {entry.images?.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {entry.images.map((img, index) => (
              <motion.img
                key={index}
                src={img}
                onClick={() => setSelectedImage(img)}
                className="w-20 h-20 object-cover rounded border border-yellow-700 hover:border-yellow-500 cursor-pointer"
                whileHover={{ scale: 1.05 }}
              />
            ))}
          </div>
        )}

        {/* 📄 Seitenzahl */}
        <div className="text-center text-xs text-yellow-600 font-sans tracking-wide mt-2 select-none">
          Seite {idx + 1}
        </div>
      </div>
    ) : (
      <div className="text-center text-sm italic text-yellow-500 mt-10">❌ Kein Eintrag vorhanden.</div>
    )}

    {/* 📷 Vergrößertes Bild */}
    <AnimatePresence>
      {selectedImage && (
        <motion.div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <motion.img
            src={selectedImage}
            className="max-w-[90%] max-h-[90%] border-4 border-yellow-700 rounded shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)
})

export default ChronikPage