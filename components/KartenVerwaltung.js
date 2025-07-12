import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import ImageUploader from './ImageUploader';

export default function KartenVerwaltung() {
  const [karten, setKarten] = useState([]);
  const [neuerTitel, setNeuerTitel] = useState('');
  const [aktuelleKartenId, setAktuelleKartenId] = useState(null);

  // Karten aus Supabase laden
  useEffect(() => {
    ladeKarten();
  }, []);

  async function ladeKarten() {
    const { data, error } = await supabase.from('maps').select('*').order('id');
    if (!error) setKarten(data);
  }

  // Neue Karte erstellen (Titel + Supabase-Insert)
  async function erstelleKarte() {
    if (!neuerTitel.trim()) return alert('Bitte einen Kartentitel angeben.');
    const { data, error } = await supabase.from('maps').insert({ title: neuerTitel }).select().single();
    if (!error) {
      setKarten([...karten, data]);
      setNeuerTitel('');
    } else {
      console.error('Fehler beim Erstellen:', error);
    }
  }

  // Karte und Bild löschen
  async function loescheKarte(id) {
    const bestaetigt = confirm('Diese Karte und ihr Bild wirklich löschen?');
    if (!bestaetigt) return;

    // 1. Storage-Bild löschen
    await supabase.storage.from('maps').remove([`${id}/map.jpg`]);

    // 2. Marker löschen (verknüpfte Marker bereinigen)
    await supabase.from('map_markers').delete().eq('map_id', id);

    // 3. Karte aus Tabelle löschen
    const { error } = await supabase.from('maps').delete().eq('id', id);
    if (!error) ladeKarten();
  }

  return (
    <div className="p-4 bg-black bg-opacity-40 rounded-xl text-white shadow-lg max-w-3xl mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">🗺 Karten-Verwaltung</h2>

      {/* Neue Karte anlegen */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          className="flex-1 px-3 py-1 rounded bg-gray-800 border border-gray-600"
          placeholder="Kartentitel eingeben…"
          value={neuerTitel}
          onChange={(e) => setNeuerTitel(e.target.value)}
        />
        <button
          onClick={erstelleKarte}
          className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-700 transition"
        >
          + Neue Karte
        </button>
      </div>

      {/* Kartenliste */}
      {karten.map((karte) => (
        <div key={karte.id} className="mb-6 border-t border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">{karte.title} (ID: {karte.id})</h3>
            <button
              onClick={() => loescheKarte(karte.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              ❌ Löschen
            </button>
          </div>

          {/* Bild-Upload für die Karte */}
          <ImageUploader
            key={entryId}
            bucket="maps"
            folder={`maps/${karte.id}`}
            images={karte.images || []} // optional
            entryId={karte.id}
            entryType="map"
            onUpload={() => ladeKarten()}
          />
        </div>
      ))}
    </div>
  );
}