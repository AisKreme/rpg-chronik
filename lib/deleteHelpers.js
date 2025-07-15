import { supabase } from './supabaseClient'
import { deleteAllImages } from './dbHelpers'

/**
 * Dynamisch importieren + PDF exportieren (nur im Browser)
 */
async function safeExportPDF(el, filename) {
  if (typeof window === 'undefined') return
  if (!el) return

  const { exportPageAsPDF } = await import('./pdfExporter')
  await exportPageAsPDF(el, filename)
}

/**
 * ⛔ Löscht einen Chronik-Eintrag + Bilder
 */
export async function deleteChronikEntry(entryId) {
  const confirmed = confirm('Willst du die Seite wirklich rausreißen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="${entryId}"]`)
  await safeExportPDF(pageEl, `chronik-${entryId}.pdf`)

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
  const confirmed = confirm('Willst du diesen NSC wirklich löschen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="nsc-${entryId}"]`)
  await safeExportPDF(pageEl, `nsc-${entryId}.pdf`)

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
  const confirmed = confirm('Willst du die Seite wirklich rausreißen?')
  if (!confirmed) return

  // (Optional) PDF vor Löschen erzeugen – wenn du ein data-entry-id="map-xyz" definierst:
  const pageEl = document.querySelector(`[data-entry-id="map-${entryId}"]`)
  await safeExportPDF(pageEl, `map-${entryId}.pdf`)

  await deleteAllImages(entryId, 'maps')
  const { error } = await supabase.from('maps').delete().eq('id', entryId)

  if (error) {
    alert('Fehler beim Löschen der Karte: ' + error.message)
  }
}