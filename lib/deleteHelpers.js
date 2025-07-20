import { supabase } from './supabaseClient'
import { deleteAllImages } from './dbHelpers'

/**
 * 🔄 Dynamischer PDF-Export: Visuelles Layout + kopierbarer Text
 */
async function safeExportPDF(el, filename, entry = null, entryType) {
  if (typeof window === 'undefined') return
  if (!el) return

  const { exportPageAsPDF } = await import('./pdfExporter')
  await exportPageAsPDF(el, filename, entry, entryType)
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
  await safeExportPDF(pageEl, `Chronik-Eintrag-${entry.id}.pdf`, entry, 'chronik')

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

  const confirmed = confirm('Willst du die Seite wirklich rausreißen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="nsc-${entry.id}"]`)
  await safeExportPDF(pageEl, `Chronik-NSC-${entry.id}.pdf`, entry, 'nsc')

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

  const confirmed = confirm('Willst du die Seite wirklich rausreißen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="map-${entry.id}"]`)
  await safeExportPDF(pageEl, `Chronik-Karte-${entry.id}.pdf`, entry, 'map')

  await deleteAllImages(entry.id, 'maps')
  const { error } = await supabase.from('maps').delete().eq('id', entry.id)

  if (error) {
    alert('Fehler beim Löschen der Karte: ' + error.message)
  }
}

/**
 * ⛔ Löscht ein Monster + zugehörige Bilder
 */
export async function deleteMonsterEntry(entry) {
  if (!entry?.id) {
    console.warn('Ungültiger Monster-Eintrag:', entry)
    return
  }

  const confirmed = confirm('Willst du die Seite wirklich rausreißen?')
  if (!confirmed) return

  const pageEl = document.querySelector(`[data-entry-id="monster-${entry.id}"]`)
  await safeExportPDF(pageEl, `Chronik-Monster-${entry.id}.pdf`, entry, 'monster')

  await deleteAllImages(entry.id, 'monster')
  const { error } = await supabase.from('monster').delete().eq('id', entry.id)

  if (error) {
    alert('Fehler beim Löschen von Monster: ' + error.message)
  }
}