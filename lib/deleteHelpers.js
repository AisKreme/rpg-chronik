import { supabase } from './supabaseClient'
import { deleteAllImages } from './dbHelpers'

/**
 * 🔄 Dynamischer PDF-Export: Visuelles Layout + kopierbarer Text
 */
async function safeExportPDF(el, filename, entry = null) {
  if (typeof window === 'undefined') return
  if (!el) return

  const { exportPageAsPDF } = await import('./pdfExporter')
  await exportPageAsPDF(el, filename, entry)
}

/**
 * ⛔ Löscht einen Chronik-Eintrag + Bilder
 */
export async function deleteChronikEntry(entry) {
  if (!entry?.id) {
    console.warn('Ungültiger Chronik-Eintrag:', entry)
    return
  }

  const confirmed = confirm('Willst du die Seite wirklich rausreißen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="${entry.id}"]`)
  await safeExportPDF(pageEl, `chronik-${entry.id}.pdf`, entry)

  await deleteAllImages(entry.id, 'chronik-images')
  const { error } = await supabase.from('chronik_entries').delete().eq('id', entry.id)

  if (error) {
    alert('Fehler beim Löschen: ' + error.message)
  }
}

/**
 * ⛔ Löscht einen NSC-Eintrag + Bilder
 */
export async function deleteNSCEntry(entry) {
  if (!entry?.id) {
    console.warn('Ungültiger NSC-Eintrag:', entry)
    return
  }

  const confirmed = confirm('Willst du diesen NSC wirklich löschen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="nsc-${entry.id}"]`)
  await safeExportPDF(pageEl, `nsc-${entry.id}.pdf`, entry)

  await deleteAllImages(entry.id, 'npcs')
  const { error } = await supabase.from('nscs').delete().eq('id', entry.id)

  if (error) {
    alert('Fehler beim Löschen: ' + error.message)
  }
}

/**
 * ⛔ Löscht eine Karte + zugehörige Bilder
 */
export async function deleteMapEntry(entry) {
  if (!entry?.id) {
    console.warn('Ungültiger Karten-Eintrag:', entry)
    return
  }

  const confirmed = confirm('Willst du die Karte wirklich löschen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="map-${entry.id}"]`)
  await safeExportPDF(pageEl, `map-${entry.id}.pdf`, entry)

  await deleteAllImages(entry.id, 'maps')
  const { error } = await supabase.from('maps').delete().eq('id', entry.id)

  if (error) {
    alert('Fehler beim Löschen der Karte: ' + error.message)
  }
}