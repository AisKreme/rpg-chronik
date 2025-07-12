import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { updateImagesInDB } from '../lib/dbHelpers'

export default function ImageUploader({
  entryId,
  bucket = 'chronik-images',
  initialImages = [],
  onUploadComplete,
}) {
  const [uploading, setUploading] = useState(false)
  const [showUploader, setShowUploader] = useState(false)
  const [localImages, setLocalImages] = useState([])
  const [previewUrl, setPreviewUrl] = useState(null)

  // 🌀 Bei entryId-Wechsel: Nur initialisieren, wenn sich die Bilder wirklich geändert haben
useEffect(() => {
  if (Array.isArray(initialImages)) {
    setLocalImages(initialImages)
  }
}, [entryId, initialImages?.length])

  // 📤 Bilder hochladen
  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    const uploadedUrls = []

    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `temp/${fileName}`
      const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file)
      if (uploadError) {
        alert('Fehler beim Hochladen: ' + uploadError.message)
        continue
      }

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath)
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl)
    }

    const updated = [...new Set([...localImages, ...uploadedUrls])]
    setLocalImages(updated)

    // In DB speichern
    if (entryId && entryId !== 'temp') {
      await updateImagesInDB(entryId, updated, bucket)
    }

    if (onUploadComplete) await onUploadComplete(updated)
    setUploading(false)
    setShowUploader(false)
    e.target.value = ''
  }

  // ❌ Bild löschen
  const handleImageDelete = async (url) => {
    if (!confirm('Bild wirklich löschen?')) return

    const pathInStorage = url.split(`${bucket}/`)[1]
    const { error } = await supabase.storage.from(bucket).remove([pathInStorage])

    if (error) {
      alert('Fehler beim Löschen: ' + error.message)
      return
    }

    const updated = localImages.filter((img) => img !== url)
    setLocalImages(updated)

    if (entryId && entryId !== 'temp') {
      await updateImagesInDB(entryId, updated, bucket)
    }

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
                onClick={() => handleImageDelete(url)}
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
        {showUploader ? 'Hochladen schließen' : '📤 Foto hochladen'}
      </button>

      {uploading && <p className="text-sm text-gray-500 mt-1">⏳ Hochladen…</p>}

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