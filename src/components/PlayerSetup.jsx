import React, { useState } from 'react';
import { Users, Plus, Trash2, Trophy, Disc, Sparkles } from 'lucide-react';
import { URBAN_ARGENTINA_PLAYLIST } from '../data/urbanArgentina';

export default function PlayerSetup({ onStartGame, hasSavedGame, onResumeGame }) {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jugador 1', cards: [], score: 0 },
    { id: 2, name: 'Jugador 2', cards: [], score: 0 }
  ]);
  const [targetCards, setTargetCards] = useState(10);
  const [selectedPlaylist, setSelectedPlaylist] = useState(URBAN_ARGENTINA_PLAYLIST.id);

  const addPlayer = () => {
    if (players.length >= 8) return;
    const nextId = players.length + 1;
    setPlayers([...players, { id: Date.now(), name: `Jugador ${nextId}`, cards: [], score: 0 }]);
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

  const handleStart = () => {
    const validPlayers = players.map(p => ({
      ...p,
      name: p.name.trim() || `Jugador ${p.id}`
    }));
    onStartGame({
      players: validPlayers,
      targetCards,
      playlistId: selectedPlaylist
    });
  };

  return (
    <div className="w-full max-w-xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* Banner de partida recuperada si existe */}
      {hasSavedGame && (
        <div 
          className="p-4 rounded-2xl border flex items-center justify-between gap-4 shadow-lg animate-pulse"
          style={{
            backgroundColor: 'var(--color-bg-surface-elevated)',
            borderColor: 'var(--color-accent)'
          }}
        >
          <div>
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              ¡Partida en curso detectada!
            </h4>
            <p className="text-xs text-slate-300">
              Parece que se recargó la página o hubo un cierre accidental.
            </p>
          </div>
          <button
            onClick={onResumeGame}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 transition-transform active:scale-95 shadow-md shrink-0"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            Reanudar Partida
          </button>
        </div>
      )}

      {/* Título y Bienvenida */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-xl mb-1">
          <Disc className="w-8 h-8 text-white animate-spin-slow" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
          BeatLine
        </h1>
        <p className="text-sm font-medium text-slate-400">
          La línea del tiempo musical para jugar en familia
        </p>
      </div>

      {/* Configuración de Jugadores */}
      <div 
        className="p-6 rounded-2xl border space-y-4 shadow-xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Jugadores ({players.length})
          </h3>
          <button
            onClick={addPlayer}
            disabled={players.length >= 8}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-950 text-violet-300 border border-violet-800/60 hover:bg-violet-900 transition-colors disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
            Añadir Jugador
          </button>
        </div>

        <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
          {players.map((player, idx) => (
            <div key={player.id} className="flex items-center gap-2">
              <span className="w-6 text-xs font-mono font-bold text-slate-500 text-center">
                #{idx + 1}
              </span>
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerName(idx, e.target.value)}
                maxLength={20}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-white font-medium text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                placeholder={`Nombre del Jugador ${idx + 1}`}
              />
              {players.length > 2 && (
                <button
                  onClick={() => removePlayer(idx)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                  aria-label="Eliminar jugador"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Parámetros de Partida */}
      <div 
        className="p-6 rounded-2xl border space-y-4 shadow-xl"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Objetivo de cartas */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Canciones para ganar
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[5, 7, 10, 15].map((count) => (
              <button
                key={count}
                onClick={() => setTargetCards(count)}
                className={`py-2 rounded-xl text-sm font-bold transition-all border ${
                  targetCards === count
                    ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {count} {count === 10 ? '⭐' : ''}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            Recomendado para partidas familiares: <strong>7 a 10 canciones</strong>.
          </p>
        </div>

        {/* Playlist inicial */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Paquete de Música
          </label>
          <div className="p-3.5 rounded-xl border border-violet-800/40 bg-violet-950/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0">
              <img 
                src={URBAN_ARGENTINA_PLAYLIST.cover} 
                alt="Urbano Argentino" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-white">{URBAN_ARGENTINA_PLAYLIST.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-1">{URBAN_ARGENTINA_PLAYLIST.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Iniciar */}
      <button
        onClick={handleStart}
        className="w-full py-4 rounded-2xl font-black text-lg text-white shadow-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
        style={{
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
          boxShadow: 'var(--shadow-glow-primary)'
        }}
      >
        ¡Comenzar Partida! 🚀
      </button>
    </div>
  );
}
