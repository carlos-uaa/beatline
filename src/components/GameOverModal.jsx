import React, { useEffect } from 'react';
import { Trophy, RotateCcw, Sparkles, Infinity as InfinityIcon, Home, Award } from 'lucide-react';
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
    } catch {}
  }, []);

  const sortedPlayers = [...players].sort(
    (a, b) => (b.cards?.length || 0) - (a.cards?.length || 0)
  );
  const topWinner = winner || sortedPlayers[0] || { name: 'Jugador' };

  // Cálculo de Premios y Medallas Graciosas
  const getMedals = () => {
    const medals = [];

    // 🦹 El Ladrón Musical (quien más robó con fichas)
    const topStealer = [...players]
      .filter(p => (p.stats?.steals || 0) > 0)
      .sort((a, b) => (b.stats?.steals || 0) - (a.stats?.steals || 0))[0];
    if (topStealer) {
      medals.push({
        emoji: '🦹',
        title: 'El Ladrón Musical',
        player: topStealer.name,
        detail: `Robó ${topStealer.stats.steals} canciones a sus rivales`
      });
    }

    // 🎯 El Francotirador (mayor porcentaje de aciertos)
    const topSniper = [...players]
      .filter(p => (p.stats?.attempts || 0) >= 2)
      .map(p => ({
        ...p,
        accuracy: Math.round(((p.stats?.hits || 0) / (p.stats?.attempts || 1)) * 100)
      }))
      .sort((a, b) => b.accuracy - a.accuracy)[0];
    if (topSniper && topSniper.accuracy >= 50) {
      medals.push({
        emoji: '🎯',
        title: 'El Francotirador',
        player: topSniper.name,
        detail: `${topSniper.accuracy}% de puntería en sus colocaciones`
      });
    }

    // 📻 Viajero del Tiempo (mayor rango de años en sus cartas)
    const topTimeTraveler = [...players]
      .map(p => {
        const years = (p.cards || []).map(c => c.year).filter(Boolean);
        const span = years.length > 1 ? Math.max(...years) - Math.min(...years) : 0;
        return { ...p, span, min: Math.min(...years), max: Math.max(...years) };
      })
      .filter(p => p.span > 5)
      .sort((a, b) => b.span - a.span)[0];
    if (topTimeTraveler) {
      medals.push({
        emoji: '📻',
        title: 'Viajero del Tiempo',
        player: topTimeTraveler.name,
        detail: `Abarca ${topTimeTraveler.span} años de historia (${topTimeTraveler.min} al ${topTimeTraveler.max})`
      });
    }

    // 🕵️ El Detective (más pistas comodín utilizadas)
    const topDetective = [...players]
      .filter(p => (p.stats?.hintsUsed || 0) > 0)
      .sort((a, b) => (b.stats?.hintsUsed || 0) - (a.stats?.hintsUsed || 0))[0];
    if (topDetective) {
      medals.push({
        emoji: '🕵️',
        title: 'El Detective',
        player: topDetective.name,
        detail: `Usó ${topDetective.stats.hintsUsed} pistas para resolver sus turnos`
      });
    }

    // 💰 El Magnate (quien terminó con más fichas guardadas)
    const topRich = [...players]
      .filter(p => (p.tokens || 0) >= 2)
      .sort((a, b) => (b.tokens || 0) - (a.tokens || 0))[0];
    if (topRich) {
      medals.push({
        emoji: '💰',
        title: 'El Magnate de Fichas',
        player: topRich.name,
        detail: `Ahorró ${topRich.tokens} fichas ⚡ en su bolsillo`
      });
    }

    return medals;
  };

  const medals = getMedals();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6 rounded-3xl border shadow-2xl text-center space-y-4"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-accent)',
          boxShadow: 'var(--shadow-glow-accent)'
        }}
      >
        <div className="inline-flex p-3 sm:p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-bounce">
          <Trophy className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        <div className="space-y-0.5">
          <span className="text-xs font-bold tracking-widest uppercase text-amber-400 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            {isFinalEnd ? '¡Resultados Finales de la Partida!' : '¡Meta Alcanzada!'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">{topWinner.name}</h2>
          <p className="text-xs text-slate-400">
            {isFinalEnd
              ? `Líder definitivo con ${topWinner.cards?.length || 0} canciones en su línea del tiempo`
              : `Alcanzó la meta con ${topWinner.cards?.length || 0} canciones ordenadas`}
          </p>
        </div>

        {/* Marcador final */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <h4 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
            Tabla de Posiciones
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {sortedPlayers.map((p, index) => (
              <div
                key={p.id}
                className={`flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium ${
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

        {/* Premios y Medallas Graciosas */}
        {medals.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-violet-800/40 space-y-2 text-left">
            <h4 className="text-[11px] font-bold uppercase text-violet-300 tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Medallas y Estadísticas de la Partida
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {medals.map((m, i) => (
                <div key={i} className="p-2 rounded-xl bg-slate-800/70 border border-slate-700/60">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span>{m.emoji}</span>
                    <span>{m.title}</span>
                  </div>
                  <div className="text-amber-300 font-bold text-[11px] mt-0.5">{m.player}</div>
                  <div className="text-[10px] text-slate-400">{m.detail}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opción destacada: Continuar Indefinidamente (Modo Libre) */}
        {onContinueEndless && (
          <div className="pt-1">
            <button
              onClick={onContinueEndless}
              className="keep-white w-full py-3 px-4 rounded-2xl font-black text-sm text-white shadow-xl transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
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
            <p className="text-[10px] text-slate-400 mt-1">
              Continúen con la misma partida acumulando canciones hasta que decidan terminar.
            </p>
          </div>
        )}

        {/* Botones de Revancha y Nueva Partida */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={onRematch}
            className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 transition-transform active:scale-95 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <RotateCcw className="w-4 h-4" /> Revancha (De 0)
          </button>
          <button
            onClick={onNewGame}
            className="py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" /> Menú Principal
          </button>
        </div>
      </div>
    </div>
  );
}
