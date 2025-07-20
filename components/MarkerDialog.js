import { useState, useEffect } from 'react'

export default function MarkerDialog({ pos, marker, onClose, onSave }) {
  const [label, setLabel] = useState('')
  const [link, setLink] = useState('')

  useEffect(() => {
    if (marker) {
      setLabel(marker.label || '')
      setLink(marker.link || '')
    } else {
      setLabel('')
      setLink('')
    }
  }, [marker])

  const handleSubmit = (e) => {
    e.preventDefault()

    const data = {
      label,
      link,
      ...(marker ? { id: marker.id, x: marker.x, y: marker.y } : pos),
    }

    onSave(data)
    onClose()
  }

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black bg-opacity-60">
      <form
        onSubmit={handleSubmit}
        className="bg-[#2d2a24] border border-yellow-700 rounded-lg p-6 shadow-xl w-[320px] space-y-4 text-parchment"
      >
        <h3 className="text-lg font-bold">
          {marker ? '📍 Marker bearbeiten' : '📍 Marker setzen'}
        </h3>

        <div>
          <label className="text-sm block mb-1">Titel:</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-2 rounded border border-yellow-700 text-black"
            required
          />
        </div>

        <div>
          <label className="text-sm block mb-1">Verlinkung (z. B. Eintrag-ID):</label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="w-full p-2 rounded border border-yellow-700 text-black"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-gray-600"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-3 py-1 rounded bg-green-800 text-white hover:bg-green-700"
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  )
}