import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Trophy, 
  Disc, 
  Sparkles, 
  Music2, 
  Clock, 
  Dices, 
  ShieldCheck 
} from 'lucide-react';
import { getAllPlaylists, deleteCustomPlaylist } from '../services/playlistStorage';
import PlaylistCreatorModal from './PlaylistCreatorModal';

export default function PlayerSetup({ onStartGame, hasSavedGame, onResumeGame }) {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jugador 1', cards: [], score: 0, tokens: 2 },
    { id: 2, name: 'Jugador 2', cards: [], score: 0, tokens: 2 }
  ]);
  const [targetCards, setTargetCards] = useState(10);
  const [difficulty, setDifficulty] = useState('classic'); // 'classic' | 'relaxed' | 'expert'
  const [turnTimerSeconds, setTurnTimerSeconds] = useState(0); // 0 (sin límite), 30, 45, 60
  const [enableEvents, setEnableEvents] = useState(true);

  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('aniversario-papas');
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    const loaded = getAllPlaylists();
    setPlaylists(loaded);
  }, []);

  const addPlayer = () => {
    if (players.length >= 8) return;
    const nextId = players.length + 1;
    setPlayers([
      ...players,
      { id: Date.now(), name: `Jugador ${nextId}`, cards: [], score: 0, tokens: 2 }
    ]);
  };

  const removePlayer = (index) => {
    if (players.length <= 2) return;
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayerName = (index, name) => {
    const updated = [...players];
    updated[index].name = name;
    setPlayers(updated);
  };

  const handlePlaylistCreated = (newPl) => {
    const updated = getAllPlaylists();
    setPlaylists(updated);
    setSelectedPlaylistId(newPl.id);
  };

  const handleDeletePlaylist = (e, id) => {
    e.stopPropagation();
    deleteCustomPlaylist(id);
    const updated = getAllPlaylists();
    setPlaylists(updated);
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(updated[0]?.id || 'urbano-argentina');
    }
  };

  const handleStart = () => {
    const initialTokens = difficulty === 'expert' ? 1 : 2;
    const validPlayers = players.map((p, idx) => ({
      ...p,
      name: p.name.trim() || `Jugador ${idx + 1}`,
      tokens: initialTokens
    }));
    onStartGame({
      players: validPlayers,
      targetCards,
      difficulty,
      turnTimerSeconds,
      enableEvents,
      playlistId: selectedPlaylistId
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-3 sm:p-5 space-y-5 animate-fadeIn">
      {/* Banner de partida recuperada si existe */}
      {hasSavedGame && (
        <div
          className="p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-lg"
          style={{
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderColor: 'var(--color-accent)'
          }}
        >
          <div>
            <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ¡Partida en curso detectada!
            </h4>
            <p className="text-[11px] sm:text-xs text-slate-300">
              Tu partida anterior sigue guardada intacta por si recargaron por error.
            </p>
          </div>
          <button
            onClick={onResumeGame}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 transition-transform active:scale-95 shadow-md shrink-0 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Reanudar Partida
          </button>
        </div>
      )}

      {/* Título y Bienvenida */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-xl mb-0.5">
          <Disc className="w-7 h-7 text-white animate-spin-slow" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          BeatLine
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-400">
          La línea del tiempo musical para jugar en familia
        </p>
      </div>

      {/* 1. Configuración de Jugadores */}
      <div
        className="p-4 sm:p-5 rounded-2xl border space-y-3.5 shadow-xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-400" />
              Jugadores ({players.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              Cada jugador inicia con <strong>{difficulty === 'expert' ? '1 Ficha' : '2 Fichas'} ⚡</strong> para robar turnos o pedir pistas
            </p>
          </div>
          <button
            onClick={addPlayer}
            disabled={players.length >= 8}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-950 text-violet-300 border border-violet-800/60 hover:bg-violet-900 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {players.map((player, idx) => (
            <div key={player.id} className="flex items-center gap-2">
              <span className="w-5 text-xs font-mono font-bold text-slate-500 text-center">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerName(idx, e.target.value)}
                maxLength={20}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-medium text-xs sm:text-sm focus:outline-none focus:border-violet-500 transition-all"
                placeholder={`Jugador ${idx + 1}`}
              />
              {players.length > 2 && (
                <button
                  onClick={() => removePlayer(idx)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  aria-label="Eliminar jugador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Dificultad y Temporizador de Adrenalina */}
      <div
        className="p-4 sm:p-5 rounded-2xl border space-y-3.5 shadow-xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Selector de Dificultad */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              Nivel de Dificultad
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setDifficulty('classic')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  difficulty === 'classic'
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🎯 Clásica
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('relaxed')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  difficulty === 'relaxed'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Margen de ±2 años para principiantes o niños"
              >
                🌱 Relajada
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('expert')}
                className={`py-2 px-1.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                  difficulty === 'expert'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Estricta + 1 sola ficha inicial"
              >
                🔥 Experto
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {difficulty === 'relaxed' 
                ? '🌱 Permite margen de ±2 años si dudas entre cartas cercanas.' 
                : difficulty === 'expert' 
                ? '🔥 Requiere posición cronológica exacta y solo 1 ficha ⚡.' 
                : '🎯 Reglas oficiales de orden relativo.'}
            </p>
          </div>

          {/* Reloj de Adrenalina */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Tiempo por Turno
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 30, 45, 60].map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setTurnTimerSeconds(sec)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    turnTimerSeconds === sec
                      ? 'bg-amber-500 border-amber-400 text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {sec === 0 ? '♾️ Libre' : `${sec}s`}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {turnTimerSeconds > 0 
                ? `⏱️ El jugador tendrá ${turnTimerSeconds}s para decidir antes de perder el turno.` 
                : '♾️ Sin límite de tiempo, ideal para debatir en familia.'}
            </p>
          </div>
        </div>

        {/* Interruptor de Eventos Sorpresa */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/15 text-pink-400">
              <Dices className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                🎲 Giros de Tuerca y Eventos Sorpresa
              </span>
              <span className="text-[10px] text-slate-400">
                Activa retos especiales cada 4 turnos (Doble o Nada, Intro de 5s, Duelos)
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEnableEvents(!enableEvents)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              enableEvents 
                ? 'bg-pink-600 text-white shadow-md' 
                : 'bg-slate-800 text-slate-500 border border-slate-700'
            }`}
          >
            {enableEvents ? 'Activados ⚡' : 'Desactivados'}
          </button>
        </div>
      </div>

      {/* 3. Selección y Creación de Playlists */}
      <div
        className="p-4 sm:p-5 rounded-2xl border space-y-3 shadow-xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <label className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <Music2 className="w-4 h-4 text-cyan-400" />
              Paquete de Música
            </label>
            <p className="text-[11px] text-slate-400">
              Selecciona una playlist o crea una propia a tu gusto
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreator(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Crear / Importar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
          {playlists.map((pl) => {
            const isSelected = selectedPlaylistId === pl.id;
            return (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylistId(pl.id)}
                className={`p-2.5 rounded-2xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-violet-950/40 border-violet-500 ring-2 ring-violet-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                  <img
                    src={pl.cover}
                    alt={pl.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-white truncate">
                    {pl.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">
                    {pl.tracks?.length || 0} canciones
                  </p>
                </div>
                {pl.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => handleDeletePlaylist(e, pl.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                    title="Eliminar esta playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Canciones para ganar */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Canciones para la Meta
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[5, 7, 10, 15].map((count) => (
              <button
                key={count}
                onClick={() => setTargetCards(count)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  targetCards === count
                    ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {count} {count === 10 ? '⭐' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Botón de Iniciar */}
      <button
        onClick={handleStart}
        className="keep-white w-full py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg text-white shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          boxShadow: 'var(--shadow-glow-primary)'
        }}
      >
        ¡Comenzar Partida! 🚀
      </button>

      {/* Modal Creador / Importador de Playlists */}
      <PlaylistCreatorModal
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />
    </div>
  );
}
