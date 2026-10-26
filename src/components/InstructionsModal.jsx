import React, { useState } from 'react';
import { BookOpen, X, Play, Award, HelpCircle, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

export default function InstructionsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl border"
        style={{
          backgroundColor: 'var(--color-bg-surface)',
          borderColor: 'var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Cabecera del Modal */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--color-bg-surface-elevated)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: 'var(--color-primary-hover)', color: '#fff' }}
            >
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Manual del Juego</h2>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                Reglas, adivinanza de canciones y Fichas BeatLine ⚡
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Cerrar instrucciones"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b px-6 gap-2 pt-2 overflow-x-auto" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            El Turno Paso a Paso
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'tokens'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            Fichas ⚡ y Robo
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Línea del Tiempo
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200 text-sm leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-violet-950/30 border-violet-800/40">
                <h3 className="font-bold text-violet-300 text-base mb-1 flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-400" />
                  ¿Cómo se juega cada turno?
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  El primer jugador en reunir <strong>10 cartas</strong> (o la meta elegida) en su línea del tiempo gana. En cada turno ocurre lo siguiente:
                </p>
              </div>

              <ol className="space-y-3 list-decimal list-inside pl-1 text-slate-300 text-xs sm:text-sm">
                <li>
                  <strong>Escucha y di qué canción es (Acuerdo Verbal):</strong> Suena el fragmento de 30 segundos. El jugador en turno intenta decir en voz alta el <strong>nombre de la canción o el artista</strong>.
                </li>
                <li>
                  <strong>¿No se la sabe? ¡Oportunidad de Robo! ⚡:</strong> Si el jugador en turno se rinde o no reconoce la canción, cualquier otro familiar puede tocar el botón <strong>"⚡ Robar Turno (1 Ficha)"</strong>, gastar 1 de sus fichas y tomar el control para colocar la carta en su propia línea del tiempo.
                </li>
                <li>
                  <strong>Coloca en la Línea del Tiempo:</strong> Toca la ranura <code>[ + Colocar aquí ]</code> donde creas que va el año de lanzamiento respecto a tus cartas actuales.
                </li>
                <li>
                  <strong>¡Revela y Confirma!:</strong> Al voltear la carta verás la portada, el nombre real y el año. Si acertaste la posición cronológica (y tus familiares validan tu respuesta), ¡te quedas la carta! Y si además dijiste bien el título y artista en voz alta, ganas <strong>+1 Ficha ⚡</strong>.
                </li>
              </ol>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-amber-950/30 border-amber-700/40">
                <h3 className="font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Sistema de Fichas BeatLine (⚡)
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Cada jugador inicia la partida con <strong>2 Fichas ⚡</strong> (y puede tener hasta un máximo de 5). En la barra superior siempre verás cuántas fichas tiene cada quién.
                </p>
              </div>

              <div className="space-y-2.5">
                <h4 className="font-bold text-white text-sm">¿Cómo se GANAN más Fichas ⚡?</h4>
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
                  🎤 <strong>Adivinando Canción y Artista en voz alta (+1 ⚡):</strong> Antes de revelar la carta, di en voz alta qué canción es y quién la canta. Al revelar la carta, toca el botón <em>"¡Dijo Canción y Artista! (+1 ⚡)"</em> para sumarte una ficha extra.
                </div>

                <h4 className="font-bold text-white text-sm pt-2">¿En qué puedes USAR tus Fichas ⚡?</h4>
                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                    <strong className="text-amber-300 block mb-0.5">1. ⚡ Robar la Canción a otro jugador (Costo: 1 ⚡)</strong>
                    Si el jugador en turno no se sabe la canción (o crees que la está desperdiciando), toca <strong>"Robar Turno"</strong> antes de revelar. Pagas 1 ficha y ahora tú colocas la canción en tu propio tablero para ganártela.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                    <strong className="text-cyan-300 block mb-0.5">2. ⏭️ Saltar Canción desconocida (Costo: 1 ⚡)</strong>
                    Si en tu turno te sale una canción dificilísima y no quieres perder tu turno ni dejar que otro la robe, paga 1 ficha para descartarla y sacar otra canción inmediatamente.
                  </div>
                  <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                    <strong className="text-emerald-300 block mb-0.5">3. 🎁 Comprar 1 Carta Directa (Costo: 3 ⚡)</strong>
                    Si logras juntar 3 fichas, puedes tocar el botón <strong>"Canjear 3 ⚡ por Carta"</strong> y sumar automáticamente 1 canción a tu línea del tiempo sin riesgo de fallar.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-cyan-950/30 border-cyan-800/40">
                <h3 className="font-bold text-cyan-300 text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Ejemplo Práctico de la Línea del Tiempo
                </h3>
                <p className="text-slate-300 mb-3 text-xs sm:text-sm">
                  Supón que en tu línea de tiempo ya tienes dos canciones ganadas:
                </p>
                <div className="flex items-center justify-center gap-3 my-2 text-xs font-mono">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                    2018 (Adán y Eva)
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                    2022 (GIVENCHY)
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  Ahora suena <strong>Canguro de WOS (2019)</strong>. Tienes 3 ranuras disponibles:
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li><span className="text-rose-400">Antes de 2018:</span> Fallo ❌</li>
                  <li><span className="text-emerald-400 font-bold">Entre 2018 y 2022:</span> ¡Acierto! ✔️ (2019 va entre 2018 y 2022).</li>
                  <li><span className="text-rose-400">Después de 2022:</span> Fallo ❌</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700">
                <h4 className="font-semibold text-white mb-1 flex items-center gap-2 text-xs sm:text-sm">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  ¿Qué pasa si dos canciones son del mismo año?
                </h4>
                <p className="text-xs text-slate-300">
                  Si colocas una canción de 2021 justo antes o después de otra que también es de 2021, el juego lo considera un <strong>acierto válido</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div
          className="px-6 py-4 border-t flex justify-end"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--color-bg-surface-elevated)' }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: 'var(--shadow-glow-primary)'
            }}
          >
            ¡Entendido, a jugar!
          </button>
        </div>
      </div>
    </div>
  );
}
