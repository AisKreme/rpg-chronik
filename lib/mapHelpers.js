// mapHelpers.js
import { supabase } from '../lib/supabaseClient'

// 🧭 Alle Marker für eine bestimmte Karte laden
export async function fetchMarkers(mapId) {
  const { data, error } = await supabase
    .from('map_markers')
    .select('*')
    .eq('map_id', mapId)

  if (error) {
    console.error('Fehler beim Laden der Marker:', error)
    return []
  }
  return data
}

// 📌 Neuen Marker speichern
export async function saveMarker(markerData) {
  const { data, error } = await supabase
    .from('map_markers')
    .insert([markerData])
    .select()

  if (error) {
    console.error('Fehler beim Speichern des Markers:', error)
    return null
  }
  return data[0]
}

// 🧼 Marker löschen
export async function deleteMarker(markerId) {
  const { error } = await supabase
    .from('map_markers')
    .delete()
    .eq('id', markerId)

  if (error) {
    console.error('Fehler beim Löschen des Markers:', error)
  }
}