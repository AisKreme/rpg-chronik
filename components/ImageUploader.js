import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ImageUploader({ entryId, initialImages = [], onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [localImages, setLocalImages] = useState(initialImages)
  const [previewUrl, setPreviewUrl] = useState(null)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)

    const uploadedUrls = []
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${entryId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('chronik-images')
        .upload(filePath, file)

      if (uploadError) {
        alert('Fehler beim Hochladen: ' + uploadError.message)
        continue
      }

      const { data } = supabase.storage.from('chronik-images').getPublicUrl(filePath)
      uploadedUrls.push(data.publicUrl)
    }

    // Upload abgeschlossen
    setUploading(false)
    setShowUploader(false) // ⬅️ Upload-Feld schließen

    // Neue Bilder zusammenführen ohne Duplikate
    const updated = [...new Set([...localImages, ...uploadedUrls])]
    setLocalImages(updated)

    if (onUploadComplete) {
      await onUploadComplete(updated)
    }

    e.target.value = '' // ⬅️ Reset input field
  }

  const handleDelete = async (url) => {
    const confirmDelete = confirm('Bild wirklich löschen?')
    if (!confirmDelete) return

    const imagePath = url.split('/').slice(-3).join('/')
    const { error } = await supabase.storage.from('chronik-images').remove([imagePath])
    if (error) {
      alert('Fehler beim Löschen: ' + error.message)
      return
    }

    const updatedImages = localImages.filter(img => img !== url)
    setLocalImages(updatedImages)

    if (onUploadComplete) {
      await onUploadComplete(updatedImages)
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setShowUploader(!showUploader)}
        className="text-sm text-blue-700 underline"
      >
        {showUploader ? 'Hochladen schließen' : 'Foto hochladen'}
      </button>

      {showUploader && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="block mt-2 text-sm"
        />
      )}

      {uploading && <p className="text-sm text-gray-500 mt-1">Hochladen…</p>}

      <div className="grid grid-cols-2 gap-2 mt-3">
        {localImages.map((url, i) => (
          <div key={i} className="relative group">
            <img
              src={url}
              alt={`Bild ${i}`}
              className="w-full h-auto rounded shadow cursor-pointer"
              onClick={() => setPreviewUrl(url)}
            />
            <button
              type="button"
              onClick={() => handleDelete(url)}
              className="absolute top-1 right-1 bg-white text-red-600 rounded-full px-2 py-0 text-sm shadow"
              title="Löschen"
            >
              ❌
            </button>
          </div>
        ))}
      </div>

      {previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewUrl(null)}
        >
          <img src={previewUrl} alt="Vorschau" className="max-w-full max-h-full rounded" />
        </div>
      )}
    </div>
  )
}