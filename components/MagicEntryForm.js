import React from 'react'
import ImageUploader from './ImageUploader'

export default function MagicEntryForm({
  note, setNote,
  flow, setFlow,
  kapitel, setKapitel,
  ort, setOrt,
  tags, setTags,
  editId,
  handleSubmit,
  resetForm,
  onClose
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl w-[420px] animate-fade-in-down border border-ink relative">
        {/* Schließen */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl text-gray-500 hover:text-red-600"
        >
          ✖
        </button>

        <h3 className="text-xl font-bold text-ink mb-4">
          {editId ? 'Eintrag bearbeiten' : 'Neuer Chronik-Eintrag'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notiz (in-character)"
            className="w-full border p-2 text-sm h-24 resize-none bg-gray-50"
          />
          <textarea
            value={flow}
            onChange={(e) => setFlow(e.target.value)}
            placeholder="Klartext"
            className="w-full border p-2 text-sm h-24 resize-none bg-gray-50"
          />
          <input
            value={kapitel}
            onChange={(e) => setKapitel(e.target.value)}
            placeholder="Kapitel"
            className="w-full border p-2 text-sm bg-gray-50"
          />
          <input
            value={ort}
            onChange={(e) => setOrt(e.target.value)}
            placeholder="Ort"
            className="w-full border p-2 text-sm bg-gray-50"
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (kommagetrennt)"
            className="w-full border p-2 text-sm bg-gray-50"
          />

          <ImageUploader entryId="new" initialImages={[]} onUploadComplete={() => {}} />

          <div className="flex justify-between mt-2">
            <button
              type="submit"
              className="bg-ink text-parchment px-4 py-1 rounded shadow"
            >
              {editId ? 'Ändern' : 'Speichern'}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm()
                onClose()
              }}
              className="border px-4 py-1 rounded text-gray-600"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}