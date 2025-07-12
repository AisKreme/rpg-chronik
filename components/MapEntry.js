// components/MapEntry.js
import React, { useState, useEffect } from 'react'
import ImageUploader from './ImageUploader'
import { supabase } from '../lib/supabaseClient'

export default function MapEntry({
  map,
  onSave,
  onDelete,
  onEdit,
  isEditing,
  setIsEditing
}) {
  const [title, setTitle] = useState(map?.title || '')
  const [beschreibung, setBeschreibung] = useState(map?.beschreibung || '')
  const [images, setImages] = useState(map?.images || [])

  useEffect(() => {
    setTitle(map?.title || '')
    setBeschreibung(map?.beschreibung || '')
    setImages(map?.images || [])
  }, [map])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newEntry = {
      title,
      beschreibung,
      images,
    }
    onSave(newEntry)
  }

  return (
    <div className="bg-[#1c1b18] p-4 rounded-lg border border-yellow-700 shadow-lg text-parchment">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Kartenname"
            className="w-full px-3 py-2 bg-[#2d2a24] text-yellow-300 border border-yellow-600 rounded focus:outline-none"
          />
          <textarea
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
            placeholder="Beschreibung oder Hinweise zur Karte"
            className="w-full px-3 py-2 bg-[#2d2a24] text-yellow-300 border border-yellow-600 rounded focus:outline-none"
          />
          <ImageUploader
            key={entryId}
            entryId={map?.id?.toString() || 'temp'}
            bucket="maps"
            initialImages={images}
            onUploadComplete={(newImages) => {
              // Verhindere doppelte Bilder
              const combined = [...new Set([...images, ...newImages])]
              setImages(combined)
            }}
          />
          <div className="flex gap-2">
            <button type="submit" className="magical-btn bg-green-800 hover:bg-green-700">
              Speichern
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="magical-btn bg-red-800 hover:bg-red-700"
            >
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <div>
          <h3 className="text-lg font-bold">🗺 {map.title}</h3>
          <p className="text-sm text-yellow-300 mb-2">{map.beschreibung}</p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {images?.map((src, idx) => (
              <img key={idx} src={src} alt="Map" className="rounded border border-yellow-700" />
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsEditing(true)} className="magical-btn bg-yellow-800 hover:bg-yellow-700">
              Bearbeiten
            </button>
            <button onClick={() => onDelete(map.id)} className="magical-btn bg-red-800 hover:bg-red-700">
              Löschen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}