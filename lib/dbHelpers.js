import { supabase } from './supabaseClient'
import { moveImagesToFinalFolder } from './saveHelpers'

/**
 * Erstellt oder aktualisiert einen Eintrag inkl. Bildverarbeitung
 * @param {string} table - Tabellenname (z. B. 'chronik_entries', 'nscs')
 * @param {object} payload - Felder ohne `images` (z. B. note, ort, etc.)
 * @param {string[]|undefined} images - Liste der (temporären) Bild-URLs
 * @param {string|null} id - Wenn vorhanden: bestehende ID für Update
 * @param {string} bucket - Supabase Storage Bucket (z. B. 'chronik-images')
 * @returns {Promise<string|null>} - Gibt die ID des Eintrags zurück oder null bei Fehler
 */


export async function saveEntryWithImages(table, payload, images = [], id = null, bucket = '') {
  let entryId = id

  // Schritt 1: Insert oder Update ohne Bilder
  if (!entryId) {
    const { data, error } = await supabase
      .from(table)
      .insert({ ...payload, images: [] }) // leeres images[] vorerst
      .select('id')
      .single()

    if (error) {
      alert(`Fehler beim Erstellen: ${error.message}`)
      
      return null
    }

    entryId = data.id.toString()
  } else {
    const { error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', entryId)

    if (error) {
      alert(`Fehler beim Aktualisieren: ${error.message}`)
      return null
    }
  }

  // Schritt 2: Bilder verschieben und aktualisieren
  let movedImages = []
  if (images && images.length > 0) {
    movedImages = await moveImagesToFinalFolder(images, entryId, bucket)

    const { error: updateError } = await supabase
      .from(table)
      .update({ images: movedImages })
      .eq('id', entryId)

    if (updateError) {
      alert(`Fehler beim Bild-Update: ${updateError.message}`)
      return null
    }
  }

  return entryId
}


export async function updateImagesInDB(entryId, images, bucket) {
  const table =
    bucket === 'npcs' ? 'nscs' :
    bucket === 'maps' ? 'maps' :
    'chronik_entries'

  const { error } = await supabase
    .from(table)
    .update({ images })
    .eq('id', entryId)

    if (error) {
      console.error('Fehler beim Speichern des neuen Bildzustands:', error.message)
      return false
    }
    return true
}


export async function deleteAllImages(entryId, bucket) {
 const table =
  bucket === 'npcs' ? 'nscs' :
  bucket === 'maps' ? 'maps' :
  bucket === 'monsters' ? 'monsters' :
  'chronik_entries'

  const { data: entry, error: fetchError } = await supabase
    .from(table)
    .select('images')
    .eq('id', entryId)
    .single()

  if (fetchError) {
    console.error('Fehler beim Laden des Eintrags:', fetchError.message)
    return
  }

  if (!entry?.images?.length) {
    console.log('Keine Bilder zum Löschen vorhanden.')
    return
  }

  const paths = entry.images
    .map((url) => {
      const idx = url.indexOf(`/${bucket}/`)
      if (idx === -1) return null
      return url.substring(idx + bucket.length + 2)
    })
    .filter(Boolean)
    .map((path) => `${entryId}/${path.split('/').pop()}`)

  console.log('Lösche Pfade aus Supabase Storage:', paths)

  const { error } = await supabase.storage.from(bucket).remove(paths)

  if (error) {
    console.error('Fehler beim Löschen der Bilder:', error.message)
  }
}