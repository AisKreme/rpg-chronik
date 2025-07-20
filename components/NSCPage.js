import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function NSCPage({ eintrag, onNSCEdit, onNSCDelete }) {
  const [previewUrl, setPreviewUrl] = useState(null)
  

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE')
  }

  const ImagePreview = () => (
<AnimatePresence>
    {previewUrl && (
      <motion.div
        key="preview-wrapper"
        className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setPreviewUrl(null)}
      >
        <motion.img
          src={previewUrl}
          className="max-w-[90%] max-h-[90%] border-4 border-yellow-700 rounded shadow-xl"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
        <button
          className="absolute top-4 right-4 text-yellow-200 bg-black/70 px-2 rounded"
          onClick={() => setPreviewUrl(null)}
        >
          ❌
        </button>
      </motion.div>
    )}
  </AnimatePresence>

  )

const sparkleHeader = (emoji, text, colorClass, glowColor) => (
  <h1 className="text-4xl font-bold mb-2 text-center relative font-verzaubert flex items-center justify-center gap-2">
    <span className={`${colorClass} text-2xl`}>{emoji}+{" "}</span>
    <span className={`relative inline-block ${colorClass} ${glowColor}`}>
      <span className="relative z-10">{text} </span>   
      <span className="absolute inset-0 blur-sm animate-glimmer from-white/10 via-yellow-400/30 to-white/10" />
    </span>
    <span className={`${colorClass} text-3xl`}>{" "}+{emoji}</span>
  </h1>
)

  const ProfileImage = ({ url }) => (
    <img
      src={url}
      onClick={() => setPreviewUrl(url)}
      className="w-24 h-24 object-cover object-top rounded shadow border-2 border-yellow-700 transition-transform duration-300 transform hover:scale-105 hover:border-green-500"
    />
  )

  if (eintrag.typ === 'sc') {
    const char = eintrag.eintrag
    return (
      <div className="flex flex-col items-center"> 
        <div className="relative w-[420px] h-[530px] overflow-y-auto border border-blue-800 bg-[#1a1e24] text-parchment p-4 shadow-xl"  data-entry-id={`nsc-${char?.id ?? 'unknown'}`}>
          {sparkleHeader('🧙', 'Spielercharakter', 'text-blue-900', 'glow-blue')}
          {char ? (
            <div className="relative border border-blue-700 p-3 rounded bg-[#0f1012] shadow">
              <button onClick={() => onNSCEdit(char)} className="absolute top-2 right-8 text-sm hover:scale-110">✏️</button>
              <button onClick={() => onNSCDelete(char.id)} className="absolute top-2 right-2 text-sm hover:scale-110">🗑️</button>
              <div className="flex items-start gap-4 mb-2">
                {char.images?.[0] && <ProfileImage url={char.images[0]} />}
                <div>
                  <h3 className="text-lg font-bold text-yellow-300">{char.name}</h3>
                  <p className="italic text-yellow-500">{char.rolle}</p>
                </div>
              </div>
              <pre className="mt-2 text-sm whitespace-pre-wrap font-sans">{char.info}</pre>
            </div>
          ) : (
            <div className="text-center text-yellow-500 mt-20">❌ Kein Eintrag vorhanden.</div>
          )}
        </div>
        <div className="w-[420px] h-[20px] bg-[#1a1e24] text-center text-xs text-blue-600">
          Spielercharaktere
        </div>
        <ImagePreview />
      </div>
    )
  }

  if (eintrag.typ === 'nsc') {
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-[420px] h-[530px] overflow-y-auto border border-green-800 bg-[#1a1e24] text-parchment p-4 shadow-xl">
          {sparkleHeader('🧌', 'NSCs', 'text-green-900', 'glow-green')}
          {eintrag.gruppe.map((nsc) => (
            <div key={nsc.id} className="relative border border-green-700 p-3 mb-4 rounded bg-[#111510] shadow"  data-entry-id={`nsc-${nsc.id}`}>
              <button onClick={() => onNSCEdit(nsc)} className="absolute top-2 right-8 text-sm hover:scale-110">✏️</button>
              <button onClick={() => onNSCDelete(nsc)} className="absolute top-2 right-2 text-sm hover:scale-110">🗑️</button>
              <div className="flex items-start gap-4 mb-2">
                {nsc.images?.[0] && <ProfileImage url={nsc.images[0]} />}
                <div>
                  <h3 className="text-lg font-bold text-yellow-300">{nsc.name}</h3>
                  <p className="italic text-yellow-500">{nsc.rolle}</p>
                  {nsc.created_at && (
                    <p className="text-xs text-gray-400 font-sans">📅 Erstes Treffen: {formatDate(nsc.created_at)}</p>
                  )}
                </div>
              </div>
              <pre className="mt-2 text-sm whitespace-pre-wrap font-sans">{nsc.info}</pre>
            </div>
          ))}
        </div>
        <div className="w-[420px] h-[20px] bg-[#1a1e24] text-center text-xs text-green-600">
          NSCs
        </div>
        <ImagePreview />
      </div>
    )
  }

  return null
}
