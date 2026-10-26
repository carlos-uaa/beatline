import React from 'react';
import { Sparkles, Dices, ArrowRight, Zap, AlertTriangle } from 'lucide-react';

export default function SurpriseEventModal({
  event,
  turnCount,
  currentPlayer,
  onClose,
  onReroll
}) {
  if (!event) return null;

  const canReroll = (currentPlayer?.tokens || 0) >= 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-lg rounded-3xl border-2 shadow-2xl p-5 sm:p-7 relative overflow-hidden flex flex-col items-center text-center animate-scaleUp"
        style={{
          backgroundColor: 'var(--color-bg-surface-elevated, #131722)',
          borderColor: event.color || 'var(--color-primary)'
        }}
      >
        {/* Glow de fondo con el color del evento */}
        <div 
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full blur-3xl opacity-35 pointer-events-none"
          style={{ backgroundColor: event.color }}
        />

        {/* Badge superior animado */}
        <div 
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wider uppercase shadow-md mb-3"
          style={{ 
            backgroundColor: `${event.color}25`, 
            color: event.color,
            border: `1px solid ${event.color}50` 
          }}
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
          <span>¡Giro Sorpresa en este Turno!</span>
        </div>

        {/* Título y Turno */}
        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          {event.title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-medium mb-4">
          Turno #{turnCount} • Jugando: <strong className="text-white">{currentPlayer?.name || 'Jugador'}</strong>
        </p>

        {/* Tarjeta explicativa del evento */}
        <div 
          className="w-full p-4 rounded-2xl border text-left space-y-2.5 mb-5 shadow-inner"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderColor: `${event.color}40`
          }}
        >
          <div className="flex items-start gap-3">
            <div 
              className="p-2.5 rounded-xl shrink-0 mt-0.5"
              style={{ backgroundColor: `${event.color}20` }}
            >
              <Zap className="w-5 h-5" style={{ color: event.color }} />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-200">
                Regla especial para esta ronda:
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full">
          {/* Opción de cambiar el evento por 1 ficha */}
          <button
            type="button"
            onClick={onReroll}
            disabled={!canReroll}
            className={`w-full sm:w-auto px-4 py-3 rounded-2xl text-xs font-bold border transition-all active:scale-95 flex items-center justify-center gap-1.5 shrink-0 ${
              canReroll
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600 hover:text-white cursor-pointer'
                : 'bg-slate-900/60 text-slate-500 border-slate-800 cursor-not-allowed opacity-60'
            }`}
            title={canReroll ? 'Gasta 1 ficha para sacar un evento aleatorio distinto' : 'Necesitas al menos 1 ficha para cambiar el evento'}
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span>Cambiar Evento (1 ⚡)</span>
          </button>

          {/* Botón principal: Aceptar y jugar */}
          <button
            type="button"
            onClick={onClose}
            className="w-full flex-1 px-6 py-3 rounded-2xl font-black text-sm text-slate-950 transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: event.color || 'var(--color-accent)' }}
          >
            <span>¡Entendido, a Jugar!</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!canReroll && (
          <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500/70" />
            No tienes fichas suficientes para cambiar el evento (tienes {currentPlayer?.tokens || 0} ⚡).
          </span>
        )}
      </div>
    </div>
  );
}
