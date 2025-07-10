import { supabase } from '../lib/supabaseClient'


export default function NSCPage({ nscs, onEdit, onDelete }) {
  return (
    <div className="relative w-[420px] h-[550px] border border-yellow-700 bg-[#2d2a24] text-parchment p-4 shadow-xl font-serif overflow-y-auto">
      <h1 className="text-2xl font-bold mb-2 text-yellow-300 text-center">🧙 NSCs</h1>

      <div className="space-y-4">
        {nscs.map((nsc) => (
          <div key={nsc.id} className="border border-yellow-700 p-3 rounded bg-[#1f1d1a] shadow">
            <h3 className="text-lg font-bold text-yellow-300">{nsc.name}</h3>
            <p className="italic text-yellow-500">{nsc.rolle}</p>
            <p className="mt-1 text-sm">{nsc.info}</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onEdit(nsc)}
                className="px-4 py-1 rounded-full bg-green-900 hover:bg-green-800 text-parchment shadow-lg shadow-green-900/30 transition-all duration-200"
              >
                ✏️ Bearbeiten
              </button>
              <button
                onClick={() => onDelete(nsc.id)}
                className="px-4 py-1 rounded-full bg-red-900 hover:bg-red-800 text-parchment shadow-lg shadow-red-900/30 transition-all duration-200"
              >
                🗑️ Löschen
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 📄 Seitenzahl unten */}
      <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-yellow-600 font-serif tracking-wide select-none">
        NSCs
      </div>
    </div>
  )
}