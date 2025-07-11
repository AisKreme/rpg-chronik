import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ImageUploader({
  entryId,
  bucket = 'chronik-images', // ⬅️ Standard: Chronik
  initialImages = [],
  onUploadComplete,
}) {
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

      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)
      if (uploadError) {
        alert('Fehler beim Hochladen: ' + uploadError.message)
        continue
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl)
    }

    setUploading(false)
    setShowUploader(false)

    const updated = [...new Set([...localImages, ...uploadedUrls])]
    setLocalImages(updated)

    if (onUploadComplete) await onUploadComplete(updated)
    e.target.value = ''
  }

  const handleDelete = async (url) => {
    if (!confirm('Bild wirklich löschen?')) return

    // ❗ Nur Dateiname extrahieren
    const imagePath = url.split('/').slice(-1)[0]
    const filePath = `${entryId}/${imagePath}`

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      alert('Fehler beim Löschen: ' + error.message)
      return
    }

    const updated = localImages.filter((img) => img !== url)
    setLocalImages(updated)
    if (onUploadComplete) await onUploadComplete(updated)
  }

  return (
    <div className="mb-4">
      <label className="text-sm text-yellow-300 mb-1 block">📸 Bilder:</label>

      {Array.isArray(localImages) && localImages.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {localImages.map((url, i) => (
            <div key={i} className="relative">
              <img
                src={url}
                className="h-20 w-20 object-cover rounded shadow cursor-pointer"
                onClick={() => setPreviewUrl(url)}
              />
              <button
                type="button"
                onClick={() => handleDelete(url)}
                className="absolute top-0 right-0 text-red-500 bg-black/70 rounded-full px-1"
                title="Löschen"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}

      {showUploader && (
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="text-sm text-yellow-200 mt-2"
        />
      )}

      <button
        type="button"
        onClick={() => setShowUploader(!showUploader)}
        className="text-sm text-blue-700 underline mt-1"
      >
        {showUploader ? 'Hochladen schließen' : 'Foto hochladen'}
      </button>

      {uploading && (
        <p className="text-sm text-gray-500 mt-1">Hochladen…</p>
      )}

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