'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSound from 'use-sound';

export default function Home() {
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [opening, setOpening] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const router = useRouter();
  const [play] = useSound('/sounds/magic-open.mp3', { volume: 0.6 });

  async function checkAccess() {
    setError('');
    const res = await fetch('/api/verify-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pw }),
    });

    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem('hasAccess', 'true');
      document.body.style.backgroundColor = '#1c1b18';
      setShowOverlay(true);
      play();
      setOpening(true);

      setTimeout(() => {
        router.push('/chronik');
      }, 1000);
    } else {
      setError('⚡ Falsches Passwort. Du erleidest 1W6 Blitzschaden!');
      setPw('');
    }
  }

  return (
    <main className="relative w-full h-screen bg-black overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 z-10 ${
          opening ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="text-center p-6 bg-black bg-opacity-60 rounded-xl shadow-xl z-20">
          <img
            src="https://cdn.pixabay.com/photo/2024/12/07/13/19/viking-9250894_1280.png"
            alt="Rune"
            className="animate-pulse mb-4 max-w-[200px] mx-auto filter drop-shadow-[0_0_15px_rgba(255,255,100,0.8)]"
          />
          <h1 className="text-6xl mb-2 text-white font-verzaubert">Der Dritte Entwurf</h1>
         <p className="mb-4 text-sm text-gray-300 italic">
          <br />
            „Verba obscura – lumen memoriae.<br />
            Wer spricht, entfesselt – wer liest, erinnert.“
            <br />
          </p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="..."
            className="px-4 py-2 rounded bg-gray-900 border border-gray-600 text-center text-white mb-2 font-sans"
          />
          <button
            onClick={checkAccess}
            className="ml-2 px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded text-white transition shadow-lg"
          >
            🪄 Öffnen
          </button>
          {error && <p className="mt-4 text-red-400">{error}</p>}
        </div>
      </div>

      {/* Buchdeckel-Animation */}
      <div
        className={`absolute w-[200%] h-full bg-[url('/bg-fantasy.jpg')] bg-cover origin-left transition-transform duration-[1500ms] ease-in-out z-0 ${
          opening ? 'rotate-y-[-180deg]' : ''
        }`}
        style={{ transformStyle: 'preserve-3d', transformOrigin: 'left' }}
      ></div>

      {/* Magisches Overlay */}
      {showOverlay && (
        <div className="fixed inset-0 bg-[#1c1b18] z-50 transition-opacity duration-700 animate-fadeIn pointer-events-none"></div>
      )}
    </main>
  );
}