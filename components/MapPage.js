import { useEffect, useState, useRef } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import Marker from './Marker'
import { fetchMarkers } from '../lib/mapHelpers'

export default function MapPage({ map }) {
  const [markers, setMarkers] = useState([])
  const [selectedMarker, setSelectedMarker] = useState(null)
  const transformRef = useRef(null)

  useEffect(() => {
    if (!map?.id) return
    async function loadMarkers() {
      const data = await fetchMarkers(map.id)
      setMarkers(data || [])
    }
    loadMarkers()
  }, [map])

  if (!map || !map.images || map.images.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-[#1c1b18] text-yellow-300 text-center">
        🗺 Keine Karte vorhanden
      </div>
    )
  }

  const imageUrl = map.images[0]

  return (
    <div className="relative w-full h-full overflow-hidden">
      <TransformWrapper
        initialScale={1.5}
        minScale={0.5}
        maxScale={5}
        centerOnInit
        limitToBounds={false}
        ref={transformRef}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            <TransformComponent wrapperClass="w-full h-full">
              <div className="w-full h-full flex items-center justify-center bg-[#1c1b18]">
                <img
                  src={imageUrl}
                  alt={map.title}
                  className="max-w-none w-full h-full object-cover select-none"
                  draggable={false}
                />
              </div>
            </TransformComponent>

            <div className="absolute top-2 right-2 z-50 flex gap-2">
              <button className="bg-yellow-800 p-2 rounded" onClick={zoomIn}>+</button>
              <button className="bg-yellow-800 p-2 rounded" onClick={zoomOut}>−</button>
              <button className="bg-yellow-800 p-2 rounded" onClick={resetTransform}>⟳</button>
            </div>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}