import React from 'react'

export default function LegendPage({ mapType }) {
  return (
    <div className="w-full h-full p-6 bg-[#1c1b18] text-yellow-300 font-serif overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4 border-b border-yellow-700 pb-2">
        🗺 Legende zur Karte: <span className="italic text-yellow-400">{mapType}</span>
      </h2>

      <ul className="space-y-3 text-sm leading-relaxed">
        <li>
          <span className="inline-block w-5">📍</span>
          <strong>Markierung:</strong> Spielerplatzierung oder bedeutender Ort
        </li>
        <li>
          <span className="inline-block w-5">🏰</span>
          <strong>Festung:</strong> Befestigte Struktur, oft strategisch wichtig
        </li>
        <li>
          <span className="inline-block w-5">❓</span>
          <strong>Unbekannt:</strong> Gebiet ohne klare Informationen
        </li>
        <li>
          <span className="inline-block w-5">🧙‍♂️</span>
          <strong>Magischer Ort:</strong> Relevanter Punkt für Magier oder Rituale
        </li>
        <li>
          <span className="inline-block w-5">⚔️</span>
          <strong>Schlachtfeld:</strong> Historische oder aktuelle Konfliktzone
        </li>
        <li>
          <span className="inline-block w-5">💀</span>
          <strong>Gefahr:</strong> Ort mit Bedrohung oder Monsteraktivität
        </li>
      </ul>

      <p className="mt-6 text-xs text-yellow-500 italic">
        Diese Legende kann je nach Kartentyp (z. B. Stadtplan, Weltkarte) angepasst werden.
      </p>
    </div>
  )
}