import React, { useEffect, useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import Marker from './Marker'
import MarkerDialog from './MarkerDialog'
import { fetchMarkers, saveMarker } from '../lib/mapHelpers'
import { supabase, supabaseUrl } from '../lib/supabaseClient'

export default function MapPage({ mapId }) {
  const [markers, setMarkers] = useState([])
  const [selectedPos, setSelectedPos] = useState(null)
  const [selectedMarker, setSelectedMarker] = useState(null)

  // 🧭 Marker laden
  useEffect(() => {
    async function loadMarkers() {
      const data = await fetchMarkers(mapId)
      setMarkers(data)
    }
    loadMarkers()
  }, [mapId])

  // 📍 Klick auf Karte → Marker setzen
  const handleMapClick = (e, bounds) => {
    const { left, top, width, height } = bounds
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height
    setSelectedPos({ x, y })
    setSelectedMarker(null)
  }

  // 💾 Marker speichern
  const handleSave = async (data) => {
    const newMarker = await saveMarker({ ...data, map_id: mapId })
    setMarkers((prev) => [...prev, newMarker])
    setSelectedPos(null)
  }

  const imageUrl = `${supabaseUrl}/storage/v1/object/public/maps/${mapId}/map.jpg`

  return (
    <div className="relative w-full h-full">
      <TransformWrapper>
        <TransformComponent>
          <div
            className="relative w-full h-full"
            onClick={(e) => {
              const bounds = e.currentTarget.getBoundingClientRect()
              handleMapClick(e, bounds)
            }}
          >
            <img
              src={imageUrl}
              alt="Karte"
              className="w-full h-full object-cover select-none"
              draggable={false}
            />

            {markers.map((m) => (
              <Marker
                key={m.id}
                x={m.x}
                y={m.y}
                label={m.label}
                onClick={() => setSelectedMarker(m)}
              />
            ))}
          </div>
        </TransformComponent>
      </TransformWrapper>

      {(selectedPos || selectedMarker) && (
        <MarkerDialog
          pos={selectedPos}
          marker={selectedMarker}
          onClose={() => {
            setSelectedPos(null)
            setSelectedMarker(null)
          }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}