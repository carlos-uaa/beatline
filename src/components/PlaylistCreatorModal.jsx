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
  Sparkles 
} from 'lucide-react';
import { 
  searchSongsLive, 
  fetchTrackReleaseYear, 
  importDeezerPlaylist, 
  enrichTrack 
} from '../services/musicService';
import { saveCustomPlaylist } from '../services/playlistStorage';

export default function PlaylistCreatorModal({ isOpen, onClose, onPlaylistCreated }) {
  const [mode, setMode] = useState('search'); // 'search' | 'deezer' | 'bulk'
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tracks, setTracks] = useState([]);

  // Buscador en vivo
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [previewPlayingUrl, setPreviewPlayingUrl] = useState(null);
  const audioPreviewRef = useRef(null);

  // Importador de Deezer
  const [deezerUrl, setDeezerUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Importador por lista de texto
  const [bulkText, setBulkText] = useState('');

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

  const handleBulkProcess = async () => {
    const lines = bulkText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 2);

    if (lines.length === 0) return;

    setIsImporting(true);
    setErrorMsg('');
    const resolved = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      setImportStatus(`Buscando canción (${i + 1}/${lines.length}): ${line}`);
      const parts = line.split('-').map((s) => s.trim());
      const artist = parts.length > 1 ? parts[0] : '';
      const songTitle = parts.length > 1 ? parts.slice(1).join(' - ') : line;

      const enriched = await enrichTrack({
        id: `bulk-${Date.now()}-${i}`,
        artist: artist || songTitle,
        title: songTitle,
        searchTerm: line
      });

      resolved.push({
        id: `bulk-${Date.now()}-${i}`,
        title: enriched.resolvedTitle || songTitle,
        artist: enriched.resolvedArtist || artist || 'Artista',
        year: enriched.year || 2020,
        artwork: enriched.artwork,
        searchTerm: line
      });
    }

    setTracks((prev) => [...prev, ...resolved]);
    setBulkText('');
    setIsImporting(false);
    setImportStatus('');
    setMode('search');
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
                Arma tu propio mazo de canciones o importa una lista completa
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
          className="flex border-b px-6 pt-2 gap-2 overflow-x-auto"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <button
            onClick={() => setMode('search')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${
              mode === 'search'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="w-4 h-4" />
            Buscador Interactivo ({tracks.length})
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${
              mode === 'bulk'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Pegar Lista de Canciones
          </button>
          <button
            onClick={() => setMode('deezer')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap ${
              mode === 'deezer'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Link2 className="w-4 h-4" />
            Importar Link de Deezer
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'deezer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-violet-950/20 border border-violet-800/40 space-y-2">
                <h4 className="font-bold text-sm text-violet-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> ¿Cómo importar desde Deezer?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  1. Entra a <a href="https://www.deezer.com" target="_blank" rel="noreferrer" className="underline text-cyan-400">deezer.com</a> y busca cualquier playlist pública (o crea una tú mismo).<br />
                  2. Copia el enlace de la playlist (ejemplo: <code className="text-amber-300">https://www.deezer.com/es/playlist/908622995</code>).<br />
                  3. Pégalo aquí abajo y BeatLine descargará las canciones, portadas y años de lanzamiento automáticamente.
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase text-slate-400">
                  Enlace o ID de Playlist de Deezer
                </label>
                <input
                  type="text"
                  value={deezerUrl}
                  onChange={(e) => setDeezerUrl(e.target.value)}
                  placeholder="https://www.deezer.com/es/playlist/..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-violet-500"
                />

                {isImporting && (
                  <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {importStatus || 'Importando canciones...'}
                  </div>
                )}

                <button
                  onClick={handleDeezerImport}
                  disabled={isImporting || !deezerUrl.trim()}
                  className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-violet-600 hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isImporting ? 'Importando Playlist...' : 'Importar Playlist Ahora'}
                </button>
              </div>
            </div>
          )}

          {mode === 'bulk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                <h4 className="font-bold text-sm text-cyan-300">
                  Pega una lista rápida de canciones
                </h4>
                <p className="text-xs text-slate-300">
                  Escribe o pega una canción por línea con el formato <strong>Artista - Canción</strong>. El sistema buscará el audio original y su año oficial de lanzamiento automáticamente.
                </p>
              </div>

              <textarea
                rows={7}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Ejemplo:\nSoda Stereo - Persiana Americana\nLuis Miguel - La Incondicional\nDaddy Yankee - Gasolina\nDuki - Givenchy`}
                className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-violet-500"
              />

              {isImporting && (
                <div className="flex items-center gap-2 text-xs text-amber-400 font-mono">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {importStatus}
                </div>
              )}

              <button
                onClick={handleBulkProcess}
                disabled={isImporting || !bulkText.trim()}
                className="w-full py-3 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 cursor-pointer"
              >
                {isImporting ? 'Procesando canciones...' : 'Buscar y Agregar Todas a mi Lista'}
              </button>
            </div>
          )}

          {mode === 'search' && (
            <div className="space-y-5">
              {/* Datos básicos de la playlist */}
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
                    placeholder="Ej. Rock, Pop y Cumbias para el domingo"
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
                  placeholder="Busca por artista y canción (ej. Duki Givenchy, Queen, BTS...)"
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
                    Resultados (Puedes escuchar el audio antes de agregar)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
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
                              className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 group bg-slate-900"
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

              {/* Canciones agregadas hasta ahora */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Canciones en esta Playlist ({tracks.length})
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Puedes ajustar el año si es una reedición
                  </span>
                </div>

                {tracks.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                    Aún no has agregado canciones. Usa el buscador de arriba o la pestaña "Pegar Lista".
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
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
                            className="p-1.5 text-slate-500 hover:text-rose-400"
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
              Mínimo requerido: <strong>3 canciones</strong> (Recomendado: 15+)
            </span>
            <button
              type="button"
              onClick={handleSaveManualPlaylist}
              disabled={tracks.length < 3}
              className="px-6 py-2.5 rounded-xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 disabled:opacity-40 cursor-pointer"
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
