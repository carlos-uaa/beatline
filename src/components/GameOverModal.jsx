import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Sparkles, Infinity as InfinityIcon, Home } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSuccessSound } from '../utils/soundEffects';

export default function GameOverModal({
  winner,
  players,
  onContinueEndless,
  onRematch,
  onNewGame,
  isFinalEnd = false
}) {
  useEffect(() => {
    playSuccessSound();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 400);
      return () => clearTimeout(timer);
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  }, []);

  const sortedPlayers = [...players].sort(
    (a, b) => (b.cards?.length || 0) - (a.cards?.length || 0)
  );
  const topWinner = winner || sortedPlayers[0] || { name: 'Jugador' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md p-6 rounded-3xl border shadow-2xl text-center space-y-5"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-accent)',
          boxShadow: 'var(--shadow-glow-accent)'
        }}
      >
        <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce">
          <Trophy className="w-11 h-11" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            {isFinalEnd ? '¡Resultados Finales de la Partida!' : '¡Meta Alcanzada!'}
          </span>
          <h2 className="text-3xl font-black text-white">{topWinner.name}</h2>
          <p className="text-xs text-slate-400">
            {isFinalEnd
              ? `Líder definitivo con ${topWinner.cards?.length || 0} canciones en su línea del tiempo`
              : `Alcanzó la meta con ${topWinner.cards?.length || 0} canciones ordenadas`}
          </p>
        </div>

        {/* Marcador final */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Tabla de Posiciones
          </h4>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {sortedPlayers.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                  index === 0
                    ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                    : 'text-slate-300 bg-slate-800/40'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-slate-500 font-mono">#{index + 1}</span>
                  {p.name}
                </span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-cyan-300">💿 {p.cards?.length || 0}</span>
                  <span className="text-amber-400">⚡ {p.tokens || 0}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Opción destacada: Continuar Indefinidamente (Modo Libre) */}
        {onContinueEndless && (
          <div className="pt-1">
            <button
              onClick={onContinueEndless}
              className="w-full py-3.5 px-4 rounded-2xl font-black text-sm text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                boxShadow: 'var(--shadow-glow-primary)'
              }}
            >
              <InfinityIcon className="w-5 h-5" />
              {isFinalEnd
                ? 'Seguir Jugando Otro Rato'
                : 'Seguir Jugando sin Límite (Modo Libre)'}
            </button>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Continúen la misma partida para ver cuántas canciones logran juntar o quién más llega a la meta.
            </p>
          </div>
        )}

        {/* Botones de Revancha y Nueva Partida */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onRematch}
            className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-slate-950 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <RotateCcw className="w-4 h-4" /> Revancha (De 0)
          </button>
          <button
            onClick={onNewGame}
            className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
