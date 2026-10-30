import React, { useState, useEffect } from 'react';
import { Wrench, Check, X, Calendar, Music, User, AlertCircle, Sparkles } from 'lucide-react';

export default function TrackCorrectionModal({
  isOpen,
  track,
  playerName,
  isAlreadyWon,
  onClose,
  onSaveCorrection
}) {
  const [year, setYear] = useState('');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (track) {
      setYear(track.year || '');
      setTitle(track.title || '');
      setArtist(track.artist || '');
      setErrorMsg('');
    }
  }, [track, isOpen]);

  if (!isOpen || !track) return null;

  const handleSave = (awardCardToPlayer) => {
    const numYear = parseInt(year, 10);
    if (isNaN(numYear) || numYear < 1900 || numYear > 2099) {
      setErrorMsg('Por favor ingresa un año válido entre 1900 y 2099.');
      return;
    }
    if (!title.trim() || !artist.trim()) {
      setErrorMsg('El título y el artista no pueden estar vacíos.');
      return;
    }

    onSaveCorrection({
      year: numYear,
      title: title.trim(),
      artist: artist.trim(),
      awardCardToPlayer
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-3xl p-5 sm:p-6 border shadow-2xl space-y-4"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Wrench className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-white">
                Corregir Datos / Año de Deezer
              </h3>
              <p className="text-xs text-slate-400">
                Ajusta el año real o el nombre si Deezer tomó una reedición o recopilatorio
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicación amigable */}
        <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200/90 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            En plataformas de streaming, canciones clásicas a veces tienen la fecha de un álbum recopilatorio póstumo o remasterización (ej. 2016 en vez de 2006). Aquí puedes corregir el año oficial para hacer justicia al jugador.
          </span>
        </div>

        {/* Formulario */}
        <div className="space-y-3 pt-1">
          {/* Año */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Año Oficial de Lanzamiento
            </label>
            <input
              type="number"
              min="1900"
              max="2099"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-base focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20 transition-all"
              placeholder="Ej. 2005"
            />
          </div>

          {/* Canción */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-cyan-400" />
              Título de la Canción
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
              placeholder="Ej. Te Quiero Así"
            />
          </div>

          {/* Artista */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-violet-400" />
              Artista / Intérprete
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-medium text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/20 transition-all"
              placeholder="Ej. Valentín Elizalde"
            />
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>
          )}
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          {!isAlreadyWon ? (
            <>
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-400 hover:brightness-110 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>Guardar Año y Otorgar Carta a {playerName}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Solo Guardar Corrección (Sin dar carta)</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="w-full py-3 px-4 rounded-xl font-black text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Guardar y Actualizar Tablero</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
