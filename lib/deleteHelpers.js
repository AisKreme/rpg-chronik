import { supabase } from './supabaseClient'
import { deleteAllImages } from './dbHelpers'

/**
 * ⛔ Löscht einen Chronik-Eintrag + Bilder
 */
export async function deleteChronikEntry(entryId) {
  const confirmed = confirm('Chronik-Eintrag wirklich löschen?')
  if (!confirmed) return

  await deleteAllImages(entryId, 'chronik-images')
  const { error } = await supabase.from('chronik_entries').delete().eq('id', entryId)

  if (error) {
    alert('Fehler beim Löschen: ' + error.message)
  }
}

/**
 * ⛔ Löscht einen NSC-Eintrag + Bilder
 */
export async function deleteNSCEntry(entryId) {
  const confirmed = confirm('NSC wirklich löschen?')
  if (!confirmed) return

  await deleteAllImages(entryId, 'npcs')
  const { error } = await supabase.from('nscs').delete().eq('id', entryId)

  if (error) {
    alert('Fehler beim Löschen: ' + error.message)
  }
}

/**
 * ⛔ Löscht eine Karte + zugehörige Bilder
 */
export async function deleteMapEntry(entryId) {
  const confirmed = confirm('Karte wirklich löschen?')
  if (!confirmed) return

  await deleteAllImages(entryId, 'maps')
  const { error } = await supabase.from('maps').delete().eq('id', entryId)

  if (error) {
    alert('Fehler beim Löschen der Karte: ' + error.message)
  }
}