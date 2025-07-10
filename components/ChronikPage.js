import { supabase } from '../lib/supabaseClient'
import ImageUploader from './ImageUploader'
import NoFlip from './NoFlip'
import React, { useState, useEffect } from 'react'

const ChronikPage = React.forwardRef(function ChronikPage(
  {
    entry,
    idx,
    visibleFlowIds,
    toggleFlow,
    handleEdit,
    handleDelete,
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
  },
  ref
) {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
        <div
          ref={ref}
          className={`page ${className} !w-auto flex flex-col justify-between px-4`}
        >
      {isForm ? (
       
        <div className="pointer-events-none h-full">
          <form
            onSubmit={handleSubmit}
            className="pointer-events-auto h-full flex flex-col justify-between space-y-2"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Notiz (in-character)"
              className="w-full bg-[#2d2a24] text-[#f0e9d2] border border-[#5a4c2c] placeholder-[#c0b9a0] rounded-md px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 font-serif text-base"
            />
            <textarea
              value={flow}
              onChange={(e) => setFlow(e.target.value)}
              placeholder="Klartext"
              className="w-full bg-[#2d2a24] text-[#f0e9d2] border border-[#5a4c2c] placeholder-[#c0b9a0] rounded-md px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 font-serif text-base"
            />
            <input
              value={kapitel}
              onChange={(e) => setKapitel(e.target.value)}
              placeholder="Kapitel"
              className="w-full bg-[#2d2a24] text-[#f0e9d2] border border-[#5a4c2c] placeholder-[#c0b9a0] rounded-md px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 font-serif text-base"
            />
            <input
              value={ort}
              onChange={(e) => setOrt(e.target.value)}
              placeholder="Ort"
              className="w-full bg-[#2d2a24] text-[#f0e9d2] border border-[#5a4c2c] placeholder-[#c0b9a0] rounded-md px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 font-serif text-base"
            />
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (kommagetrennt)"
              className="w-full bg-[#2d2a24] text-[#f0e9d2] border border-[#5a4c2c] placeholder-[#c0b9a0] rounded-md px-3 py-2 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-600 font-serif text-base"
            />

           <ImageUploader
            entryId={editId ? editId.toString() : 'temp'}
            initialImages={images}
            onUploadComplete={(newImages) => setImages(newImages)}
          />

            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-ink text-parchment px-4 py-1 rounded">
                {editId ? 'Ändern' : 'Speichern'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="border px-4 py-1 text-gray-700 rounded"
                >
                  Abbrechen
                </button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs text-gray-500">ID: {entry.id}</p>
            <h3 className="text-lg font-bold">{entry.kapitel}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {entry.date} – {entry.ort}
            </p>
            <div className="italic max-h-40 overflow-y-auto pr-1 text-sm border border-gray-300 rounded bg-white p-2">
              „{entry.note}“
            </div>
            {visibleFlowIds.includes(entry.id) && (
              <div 
              className="mt-3 text-gray-800 whitespace-pre-line text-sm max-h-40 overflow-y-auto pr-1 border border-gray-200 bg-white rounded p-2">
                {entry.flow}
              </div>
            )}

            {/* Bilder anzeigen */}
          {entry.images && entry.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {entry.images.map((imgPath, index) => {
                const publicUrl = imgPath

                return (
                  <img
                    key={index}
                    src={publicUrl}
                    alt={`Bild ${index + 1}`}
                    onClick={() => setSelectedImage(publicUrl)}
                    className="rounded shadow border border-gray-300 max-h-40 object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                  />
                )
              })}
            </div>
          )}

          </div>

          <NoFlip>
              <div className="flex text-sm justify-center items-center h-full gap-3">
                <button
                  onClick={() => toggleFlow(entry.id)}
                  className="px-4 py-1 rounded-full bg-blue-900 hover:bg-blue-800 text-parchment shadow-lg shadow-blue-900/30 transition-all duration-200"
                >
                  {visibleFlowIds.includes(entry.id) ? 'Klartext verbergen' : 'Klartext'}
                </button>
                <button
                  onClick={() => handleEdit(entry)}
                  className="px-4 py-1 rounded-full bg-green-900 hover:bg-green-800 text-parchment shadow-lg shadow-green-900/30 transition-all duration-200"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="px-4 py-1 rounded-full bg-red-900 hover:bg-red-800 text-parchment shadow-lg shadow-red-900/30 transition-all duration-200"
                >
                  Löschen
                </button>
              </div>
          </NoFlip>
        </>
      )}
      {selectedImage && (
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-70 animate-fade-in"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative bg-[#1c1b18] p-4 rounded-lg shadow-xl border border-yellow-700 max-w-[90%] max-h-[90%] overflow-hidden"
              onClick={(e) => e.stopPropagation()} // verhindert Schließen beim Klick ins Bild
            >
              <img
                src={selectedImage}
                alt="Vergrößertes Bild"
                className="max-w-full max-h-[80vh] rounded transition-transform duration-300 transform scale-100"
              />
              <button
                className="absolute top-2 right-2 text-red-700 hover:text-yellow-200 text-2xl font-bold"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>

            </div>
          </div>
        )}
    </div>
  )
})

export default ChronikPage