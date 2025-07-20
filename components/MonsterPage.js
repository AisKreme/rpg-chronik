import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MonsterPage({ eintrag, onMonsterDelete, onMonsterEdit, idx }) {
  const [previewUrl, setPreviewUrl] = useState(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('de-DE')
  }

  const sparkleHeader = () => (
    <h1 className="text-4xl font-bold mb-2 text-center relative font-verzaubert flex items-center justify-center gap-2 text-red-800">
      <span className={`text-2xl`}>👹+{" "}</span>
      <span className="relative inline-block glow-red">
        <span className="relative z-10">Monster</span>
        <span className="absolute inset-0 blur-sm animate-glimmer from-white/10 via-red-500/30 to-white/10" />
      </span>
      <span className={`text-2xl`}>{" "}+👹</span>
    </h1>
  )

  const ProfileImage = ({ url }) => (
    <img
      src={url}
      onClick={() => setPreviewUrl(url)}
      className="w-24 h-24 object-cover object-top rounded shadow border-2 border-red-700 transition-transform duration-300 transform hover:scale-105 hover:border-yellow-400 cursor-pointer"
    />
  )

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
          /><button
          className="absolute top-4 right-4 text-yellow-200 bg-black/70 px-2 rounded"
          onClick={() => setPreviewUrl(null)}
        >
          ❌
        </button>
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex flex-col items-center ">
      {/* 🧱 Seitencontainer mit fester Größe */}
      <div
        className="relative w-[420px] h-[530px] overflow-hidden border border-red-800 bg-[#1a1e24] text-parchment p-4 shadow-xl"
        data-entry-id={`monster-${eintrag?.id ?? 'unknown'}`}
      >
        {sparkleHeader()}
        {eintrag ? (
          <div className="relative border border-red-700 p-3 rounded bg-[#0f1012] shadow h-full">
            {/* ✏️🗑️ Buttons */}
            <button onClick={() => onMonsterEdit(eintrag)} className="absolute top-2 right-8 text-sm hover:scale-110">✏️</button>
            <button onClick={() => onMonsterDelete(eintrag)} className="absolute top-2 right-2 text-sm hover:scale-110">🗑️</button>

            <div className="flex items-start gap-4 mb-2">
              {eintrag.images?.[0] && <ProfileImage url={eintrag.images[0]} />}
              <div>
                <h3 className="text-lg font-bold text-yellow-300">{eintrag.name}</h3>
                <p className="italic text-yellow-500">📍 {eintrag.ort}</p>
                {eintrag.created_at && (
                  <p className="text-xs text-gray-400 font-sans">📅 Sichtung: {formatDate(eintrag.created_at)}</p>
                )}
              </div>
            </div>

            <pre className="mt-2 text-sm text-yellow-400 font-sans whitespace-pre-wrap">{eintrag.werte}</pre>
            <pre className="mt-2 text-sm text-yellow-100 font-sans whitespace-pre-wrap max-h-[160px] overflow-y-auto pr-1">
              {eintrag.beschreibung}
            </pre>
          </div>
        ) : (
          <div className="text-center text-yellow-500 mt-20">❌ Kein Eintrag vorhanden.</div>
        )}
      </div>

      {/* 🖼 Bildvorschau */}
      <ImagePreview />

      {/* 🔻 Fußzeile */}
      <div className="w-[420px] h-[20px] bg-[#1a1e24] text-center text-xs text-red-600">
        Monster
      </div>
    </div>
  )
}