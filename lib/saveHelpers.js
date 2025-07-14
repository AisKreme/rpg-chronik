import { supabase } from './supabaseClient'
import { saveEntryWithImages } from './dbHelpers'

/**
 * Verschiebt temporäre Bilder in den finalen Ordner und liefert die finalen URLs zurück
 */
export async function moveImagesToFinalFolder(images, newId, bucket) {
  console.log('📦 moveImagesToFinalFolder input:', images, newId, bucket)
  const movedUrls = []

  for (const url of images) {
    if (!url.includes('/temp/')) {
      movedUrls.push(url)
      continue
    }

    const fullPath = url.split('/storage/v1/object/public/')[1]
    const oldPath = fullPath.replace(`${bucket}/`, '')
    const filename = oldPath.split('/').pop()
    const newPath = `${newId}/${filename}`
console.log('➡️ Versuche zu kopieren:', oldPath, '→', newPath)
    const { error: copyError } = await supabase.storage.from(bucket).copy(oldPath, newPath)
    if (copyError) {
      console.error('Fehler beim Kopieren:', copyError.message)
      continue
    }

    await supabase.storage.from(bucket).remove([oldPath])

    const publicUrl = `${supabase.storageUrl}/object/public/${bucket}/${newPath}`
    movedUrls.push(publicUrl)
  }

  return movedUrls
}

/**
 * Speichert oder aktualisiert einen Chronik-Eintrag mit Bildern
 */
export async function saveChronikEntry({ note, flow, kapitel, ort, tags, images, editId }) {
  const payload = {
    note,
    flow,
    kapitel,
    ort,
    tags: tags.split(',').map((t) => t.trim()),
  }
  
  if (!editId) {
    // Nur beim NEUEN Eintrag das Datum setzen
    payload.date = new Date().toISOString().split('T')[0]
  }

  const newId = await saveEntryWithImages(
    'chronik_entries',
    payload,
    images,
    editId,
    'chronik-images'
  )

  return newId
}

/**
 * Speichert oder aktualisiert einen NSC-Eintrag mit Bildern
 */
export async function saveNSCEntry({ name, rolle, info, images, editNSCId }) {
  const payload = {
    name,
    rolle,
    info
  }

  const newId = await saveEntryWithImages(
    'nscs',
    payload,
    images,
    editNSCId,
    'npcs'
  )

  return newId
}

/**
 * Speichert oder aktualisiert einen Karten-Eintrag mit Bildern
 */
export async function saveMapEntry({ title, images, editMapId }) {
  const payload = {
    title
  }

  const newId = await saveEntryWithImages(
    'maps',
    payload,
    images,
    editMapId,
    'maps'
  )

  return newId
}