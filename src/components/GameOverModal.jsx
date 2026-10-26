import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function GameOverModal({ winner, players, onRematch, onNewGame }) {
  useEffect(() => {
    // Lanzar confeti celebratorio
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md p-6 rounded-3xl border shadow-2xl text-center space-y-6"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-accent)',
          boxShadow: 'var(--shadow-glow-accent)'
        }}
      >
        <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" /> ¡Tenemos un Campeón Musical!
          </span>
          <h2 className="text-3xl font-black text-white">{winner.name}</h2>
          <p className="text-xs text-slate-400">
            Completó su línea de tiempo cronológica con maestría
          </p>
        </div>

        {/* Marcador final */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
            Posiciones Finales
          </h4>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {[...players]
              .sort((a, b) => (b.cards?.length || 0) - (a.cards?.length || 0))
              .map((p, index) => (
                <div 
                  key={p.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                    p.id === winner.id 
                      ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' 
                      : 'text-slate-300 bg-slate-800/40'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">#{index + 1}</span>
                    {p.name}
                  </span>
                  <span>{p.cards?.length || 0} canciones</span>
                </div>
              ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={onRematch}
            className="py-3 px-4 rounded-xl font-bold text-sm text-slate-950 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <RotateCcw className="w-4 h-4" /> Revancha
          </button>
          <button
            onClick={onNewGame}
            className="py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 cursor-pointer"
          >
            Nueva Partida
          </button>
        </div>
      </div>
    </div>
  );
}
