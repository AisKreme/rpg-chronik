import { useState } from 'react'
import ImageUploader from './ImageUploader'
import { saveEntryWithImages } from '../lib/dbHelpers'

export default function LegendPage({
  mapType = 'Unbekannt',
  initialTitle = '',
  initialImages = [],
  editMapId = null
}) {
  const [title, setTitle] = useState(initialTitle)
  const [images, setImages] = useState(initialImages)

  // 🧠 Lokale Speicherfunktion für Karten
  async function saveMapEntry(title, images, editMapId = null) {
    const payload = { title }

    const newId = await saveEntryWithImages(
      'maps',       // Supabase-Tabelle
      payload,      // Nur Titel
      images,       // Bilder (temp oder verschoben)
      editMapId,    // ID wenn bearbeiten
      'maps'        // Bucket-Name
    )

    return newId
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newId = await saveMapEntry(title, images, editMapId)
    if (newId) {
      alert('🗺 Karte gespeichert.')
    }
  }

  return (
    <div className="w-full h-full p-6 bg-[#1c1b18] text-yellow-300 font-serif overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 border-b border-yellow-700 pb-2">
        🗺 Legende zur Karte: <span className="italic text-yellow-400">{mapType}</span>
      </h2>

      {/* 📘 Legende */}
      <ul className="space-y-3 text-sm leading-relaxed mb-6">
        <li><span className="inline-block w-5">📍</span><strong>Markierung:</strong> Spielerplatzierung oder bedeutender Ort</li>
        <li><span className="inline-block w-5">🏰</span><strong>Festung:</strong> Befestigte Struktur, oft strategisch wichtig</li>
        <li><span className="inline-block w-5">❓</span><strong>Unbekannt:</strong> Gebiet ohne klare Informationen</li>
        <li><span className="inline-block w-5">🧙‍♂️</span><strong>Magischer Ort:</strong> Relevanter Punkt für Magier oder Rituale</li>
        <li><span className="inline-block w-5">⚔️</span><strong>Schlachtfeld:</strong> Historische oder aktuelle Konfliktzone</li>
        <li><span className="inline-block w-5">💀</span><strong>Gefahr:</strong> Ort mit Bedrohung oder Monsteraktivität</li>
      </ul>

      {/* 📄 Formular zur Kartenspeicherung */}
      <form onSubmit={handleSubmit} className="space-y-3 mt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Kartentitel eingeben"
          className="w-full bg-[#2d2a24] text-yellow-200 border border-yellow-700 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-yellow-600"
        />

        <ImageUploader
          key={entryId}
          entryId={editMapId ? editMapId.toString() : 'temp'}
          bucket="maps"
          initialImages={images}
          onUploadComplete={(newImages) => {
            // Verhindere doppelte Bilder
            const combined = [...new Set([...images, ...newImages])]
            setImages(combined)
}}
        />

        <button
          type="submit"
          className="w-full bg-green-900 hover:bg-green-800 text-parchment py-2 rounded shadow-lg shadow-green-900/30"
        >
          {editMapId ? '🛠️ Karte aktualisieren' : '➕ Karte speichern'}
        </button>
      </form>

      <p className="mt-6 text-xs text-yellow-500 italic">
        Diese Legende kann je nach Kartentyp (z. B. Stadtplan, Weltkarte) angepasst werden.
      </p>
    </div>
  )
}