import React, { useState, useRef } from 'react';
import { 
  X, 
  Search, 
  Plus, 
  Trash2, 
  Play, 
  Pause, 
  Music, 
  Link2, 
  FileText, 
  Check, 
  Loader2,
  Sparkles,
  Upload
} from 'lucide-react';
import { 
  searchSongsLive, 
  fetchTrackReleaseYear, 
  importDeezerPlaylist,
  importSpotifyPlaylist,
  enrichTrack 
} from '../services/musicService';
import { saveCustomPlaylist } from '../services/playlistStorage';

export default function PlaylistCreatorModal({ isOpen, onClose, onPlaylistCreated }) {
  const [mode, setMode] = useState('spotify'); // 'spotify' | 'search' | 'bulk' | 'deezer'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState([]);

  // Importador de Spotify
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Buscador en vivo
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [previewPlayingUrl, setPreviewPlayingUrl] = useState(null);
  const audioPreviewRef = useRef(null);

  // Importador de Deezer
  const [deezerUrl, setDeezerUrl] = useState('');

  // Importador por lista de texto o CSV
  const [bulkText, setBulkText] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const stopPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setPreviewPlayingUrl(null);
  };

  const togglePreview = (url) => {
    if (!url) return;
    if (previewPlayingUrl === url) {
      stopPreview();
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.src = url;
        audioPreviewRef.current.play().catch(() => {});
        setPreviewPlayingUrl(url);
      }
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setErrorMsg('');
    const results = await searchSongsLive(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleAddFromSearch = async (item) => {
    setAddingId(item.deezerId);
    const year = await fetchTrackReleaseYear(item.deezerId);
    const newTrack = {
      id: `custom-${item.deezerId}-${Date.now()}`,
      deezerId: item.deezerId,
      title: item.title,
      artist: item.artist,
      year,
      artwork: item.artwork,
      searchTerm: `${item.artist} ${item.title}`
    };
    setTracks((prev) => [...prev, newTrack]);
    setAddingId(null);
  };

  const handleRemoveTrack = (id) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdateYear = (id, newYear) => {
    const parsed = parseInt(newYear, 10);
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, year: isNaN(parsed) ? t.year : parsed } : t))
    );
  };

  const handleSpotifyImport = async () => {
    if (!spotifyUrl.trim()) return;
    setIsImporting(true);
    setErrorMsg('');
    try {
      const imported = await importSpotifyPlaylist(spotifyUrl);
      saveCustomPlaylist(imported);
      stopPreview();
      onPlaylistCreated(imported);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo importar la playlist de Spotify. Verifica que sea pública.');
    } finally {
      setIsImporting(false);
      setImportStatus('');
    }
  };

  const handleDeezerImport = async () => {
    if (!deezerUrl.trim()) return;
    setIsImporting(true);
    setErrorMsg('');
    try {
      const imported = await importDeezerPlaylist(deezerUrl, (curr, total, name) => {
        setImportStatus(`Importando (${curr}/${total}): ${name}`);
      });
      saveCustomPlaylist(imported);
      stopPreview();
      onPlaylistCreated(imported);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo importar la playlist. Verifica que sea pública.');
    } finally {
      setIsImporting(false);
      setImportStatus('');
    }
  };

  const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    return values;
  };

  const handleProcessTextOrCsv = (rawInput = null) => {
    const textToProcess = (typeof rawInput === 'string' ? rawInput : bulkText).trim();
    if (!textToProcess) return;

    const lines = textToProcess.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 2);
    if (lines.length === 0) return;

    setErrorMsg('');

    // Detectar si es un CSV con cabeceras (como Exportify, TuneMyMusic, Chosic)
    const firstLineValues = parseCsvLine(lines[0]);
    const firstLineLower = firstLineValues.map((v) => v.toLowerCase());

    const titleIdx = firstLineLower.findIndex((v) =>
      v.includes('track name') || v.includes('title') || v.includes('nombre') || v.includes('canción') || v.includes('cancion')
    );
    const artistIdx = firstLineLower.findIndex((v) =>
      v.includes('artist') || v.includes('artista')
    );
    const dateIdx = firstLineLower.findIndex((v) =>
      v.includes('release date') || v.includes('date') || v.includes('fecha') || v.includes('year') || v.includes('año')
    );

    let parsedTracks = [];

    if (titleIdx !== -1 && artistIdx !== -1) {
      // Formato CSV delimitado con cabeceras
      for (let i = 1; i < lines.length; i++) {
        const row = parseCsvLine(lines[i]);
        const trackTitle = row[titleIdx];
        const artistName = row[artistIdx];
        let yearNum = null;
        if (dateIdx !== -1 && row[dateIdx]) {
          const match = row[dateIdx].match(/\b(19\d\d|20\d\d)\b/);
          if (match) yearNum = parseInt(match[1], 10);
        }

        if (trackTitle && artistName) {
          parsedTracks.push({
            id: `csv-${Date.now()}-${i}`,
            title: trackTitle,
            artist: artistName,
            year: yearNum,
            searchTerm: `${artistName} ${trackTitle}`
          });
        }
      }
    } else {
      // Formato de texto línea por línea ("Artista - Canción" o "Canción")
      parsedTracks = lines.map((line, i) => {
        const cleanLine = line.replace(/^\d+[\.\)\-]\s*/, '');
        const parts = cleanLine.split('-').map((s) => s.trim());
        const artist = parts.length > 1 ? parts[0] : 'Artista';
        const songTitle = parts.length > 1 ? parts.slice(1).join(' - ') : cleanLine;
        return {
          id: `bulk-${Date.now()}-${i}`,
          title: songTitle,
          artist: artist,
          searchTerm: cleanLine
        };
      });
    }

    if (parsedTracks.length === 0) {
      setErrorMsg('No se detectaron canciones válidas en el texto o archivo.');
      return;
    }

    setTracks((prev) => [...prev, ...parsedTracks]);
    setBulkText('');
    setImportStatus(`¡Se cargaron ${parsedTracks.length} canciones con éxito!`);
    setMode('search');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleProcessTextOrCsv(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveManualPlaylist = () => {
    if (tracks.length < 3) {
      setErrorMsg('Agrega al menos 3 canciones para poder jugar con esta playlist.');
      return;
    }
    const newPlaylist = {
      id: `custom-${Date.now()}`,
      title: title.trim() || 'Mi Playlist Personalizada 🎵',
      description: description.trim() || `${tracks.length} canciones seleccionadas a medida`,
      cover:
        tracks[0]?.artwork ||
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
      tracks,
      isCustom: true
    };
    saveCustomPlaylist(newPlaylist);
    stopPreview();
    onPlaylistCreated(newPlaylist);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <audio ref={audioPreviewRef} onEnded={() => setPreviewPlayingUrl(null)} />

      <div
        className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden border shadow-2xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Cabecera */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl text-white"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Crear / Importar Playlist</h2>
              <p className="text-xs text-slate-400">
                Usa tu cuenta gratuita de Spotify, el buscador integrado o pega una lista
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPreview();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pestañas de Método */}
        <div
          className="flex border-b px-4 sm:px-6 pt-2 gap-2 overflow-x-auto"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <button
            onClick={() => setMode('spotify')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              mode === 'spotify'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4 text-emerald-400" />
            Importar de Spotify 🟢
          </button>
          <button
            onClick={() => setMode('search')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              mode === 'search'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Buscador en la App ({tracks.length})
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              mode === 'bulk'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-4 h-4" />
            Pegar Lista / Subir CSV 📄
          </button>
          <button
            onClick={() => setMode('deezer')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              mode === 'deezer'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Link de Deezer
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* MODO SPOTIFY (RECOMENDADO) */}
          {mode === 'spotify' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 space-y-2">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> ¡La forma más fácil y 100% gratuita!
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  No necesitas pagar nada en Deezer. Puedes armar tu playlist en la app gratuita de <strong>Spotify</strong> (o usar cualquier playlist pública de Spotify que te guste):<br />
                  1. En Spotify, toca los 3 puntos de la playlist y dale a <strong>"Compartir" ➔ "Copiar enlace"</strong>.<br />
                  2. Pégalo aquí abajo y BeatLine descargará todas las canciones, audios y años oficiales automáticamente.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  Enlace de Playlist de Spotify
                </label>
                <input
                  type="text"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  placeholder="https://open.spotify.com/playlist/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />

                {isImporting && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {importStatus || 'Importando canciones de Spotify...'}
                  </div>
                )}

                <button
                  onClick={handleSpotifyImport}
                  disabled={isImporting || !spotifyUrl.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  {isImporting ? 'Importando Playlist de Spotify...' : 'Importar Playlist de Spotify Ahora'}
                </button>
              </div>
            </div>
          )}

          {/* MODO BUSCADOR INTEGRADO */}
          {mode === 'search' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Nombre de tu Playlist
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Favoritas de la Familia"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Descripción corta (opcional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej. Rock, Pop y Cumbias para el fin de semana"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Buscador en vivo */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Busca por artista y canción (ej. Queen Bohemian, Duki, Shakira...)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar
                </button>
              </form>

              {/* Resultados de búsqueda */}
              {searchResults.length > 0 && (
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold uppercase text-slate-400 px-1">
                    Resultados (Escucha el audio antes de agregar)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {searchResults.map((item) => {
                      const isAdded = tracks.some((t) => t.deezerId === item.deezerId);
                      const isPlayingThis = previewPlayingUrl === item.previewUrl;
                      return (
                        <div
                          key={item.deezerId}
                          className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-800/70 border border-slate-700/60"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => togglePreview(item.previewUrl)}
                              className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 group bg-slate-900 cursor-pointer"
                              title="Escuchar preview"
                            >
                              <img src={item.artwork} alt={item.title} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                                {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                              </div>
                            </button>
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-white truncate">{item.title}</h5>
                              <p className="text-[11px] text-slate-400 truncate">{item.artist}</p>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isAdded || addingId === item.deezerId}
                            onClick={() => handleAddFromSearch(item)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer ${
                              isAdded
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/40'
                                : 'bg-violet-600 text-white hover:bg-violet-500'
                            }`}
                          >
                            {addingId === item.deezerId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" /> Lista
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" /> Agregar
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Canciones agregadas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Canciones en esta Playlist ({tracks.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Puedes ajustar el año si es necesario
                  </span>
                </div>

                {tracks.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Aún no has agregado canciones. Busca canciones arriba o importa desde Spotify.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                    {tracks.map((t, index) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-slate-500 font-mono">#{index + 1}</span>
                          {t.artwork && (
                            <img src={t.artwork} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-bold text-white">{t.title}</span>
                            <span className="text-slate-400"> • {t.artist}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <input
                            type="number"
                            value={t.year}
                            onChange={(e) => handleUpdateYear(t.id, e.target.value)}
                            className="w-16 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold text-center text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveTrack(t.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODO LISTA DE TEXTO O ARCHIVO CSV */}
          {mode === 'bulk' && (
            <div className="space-y-4">
              {/* Opción 1: Subida de archivo directa (Ideal para 300+ canciones) */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="p-4 sm:p-5 rounded-2xl border-2 border-dashed border-amber-500/50 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-950/30 text-center cursor-pointer transition-all space-y-1.5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="inline-flex p-2.5 rounded-full bg-amber-400/15 text-amber-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-white block">
                    📂 Subir archivo .CSV o .TXT de tu Playlist
                  </span>
                  <span className="text-[11px] text-slate-300">
                    Sube el archivo descargado de <strong>Exportify</strong>, <strong>TuneMyMusic</strong> o tu bloc de notas. ¡Carga 300+ canciones en 1 segundo!
                  </span>
                </div>
              </div>

              {/* Separador */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-slate-900 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  O pega el texto / CSV manualmente
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>

              <textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Pega aquí el contenido de tu archivo CSV o escribe una canción por línea:\n\nArtista - Canción\nSoda Stereo - De Música Ligera\nLuis Miguel - Ahora Te Puedes Marchar\nBad Bunny - Tití Me Preguntó`}
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500"
              />

              {importStatus && (
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-xl">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{importStatus}</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleProcessTextOrCsv()}
                disabled={isImporting || !bulkText.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 cursor-pointer transition-all shadow-lg"
              >
                Procesar y Agregar Canciones a mi Lista
              </button>
            </div>
          )}

          {/* MODO DEEZER */}
          {mode === 'deezer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-2">
                <h4 className="font-bold text-sm text-cyan-300">
                  Importar desde enlace de Deezer
                </h4>
                <p className="text-xs text-slate-300">
                  Si tienes el link de cualquier playlist pública de Deezer en la web, pégalo aquí para importarla.
                </p>
              </div>

              <input
                type="text"
                value={deezerUrl}
                onChange={(e) => setDeezerUrl(e.target.value)}
                placeholder="https://www.deezer.com/es/playlist/..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
              />

              {isImporting && (
                <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {importStatus}
                </div>
              )}

              <button
                onClick={handleDeezerImport}
                disabled={isImporting || !deezerUrl.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 cursor-pointer"
              >
                {isImporting ? 'Importando...' : 'Importar de Deezer'}
              </button>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        {mode === 'search' && (
          <div
            className="px-6 py-4 border-t flex items-center justify-between"
            style={{
              backgroundColor: 'var(--color-bg-surface-elevated)',
              borderColor: 'var(--border-subtle)'
            }}
          >
            <span className="text-xs text-slate-400">
              Mínimo: <strong>3 canciones</strong> (Recomendado: 15+)
            </span>
            <button
              type="button"
              onClick={handleSaveManualPlaylist}
              disabled={tracks.length < 3}
              className="keep-white px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
              style={{
                backgroundColor: 'var(--color-primary)',
                boxShadow: 'var(--shadow-glow-primary)'
              }}
            >
              Guardar Playlist ({tracks.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
