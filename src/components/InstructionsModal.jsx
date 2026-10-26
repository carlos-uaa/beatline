import React, { useState } from 'react';
import { BookOpen, X, Play, Award, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';

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
                Cómo jugar y ganar en BeatLine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white"
            aria-label="Cerrar instrucciones"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b px-6 gap-2 pt-2" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            Reglas Básicas
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            La Línea de Tiempo
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'tips'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4" />
            Consejos en Familia
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200 text-sm leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-violet-950/30 border-violet-800/40">
                <h3 className="font-bold text-violet-300 text-base mb-1 flex items-center gap-2">
                  <Award className="w-5 h-5 text-violet-400" />
                  El Gran Objetivo
                </h3>
                <p className="text-slate-300">
                  Sé el primer jugador en construir una línea de tiempo cronológica con <strong>10 canciones</strong> (o las acordadas). No necesitas saber el año exacto de memoria, solo saber si la canción es más vieja o más nueva que las que ya tienes.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white text-base">¿Cómo funciona cada turno?</h4>
                <ol className="space-y-2.5 list-decimal list-inside pl-1 text-slate-300">
                  <li>
                    <strong>Escucha la pista:</strong> La tablet reproduce un fragmento de 30 segundos de una canción misteriosa sin mostrar su título ni su año.
                  </li>
                  <li>
                    <strong>Decide la posición:</strong> Mira las cartas que ya tienes en tu línea del tiempo. Toca la ranura donde creas que encaja (antes de tu canción más antigua, entre dos canciones o después de la más reciente).
                  </li>
                  <li>
                    <strong>¡Revela la carta!:</strong> Presiona el botón de revelar. La tarjeta girará mostrando la portada, el artista, el título y el año oficial.
                  </li>
                  <li>
                    <strong>Acierto o Fallo:</strong> Si la colocaste en el orden correcto, ¡la carta es tuya y suma para tu victoria! Si te equivocaste, la carta se descarta y el turno pasa al siguiente familiar.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border bg-cyan-950/30 border-cyan-800/40">
                <h3 className="font-bold text-cyan-300 text-base mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                  Ejemplo Práctico de Colocación
                </h3>
                <p className="text-slate-300 mb-3">
                  Supón que en tu línea de tiempo ya tienes dos canciones ganadas:
                </p>
                <div className="flex items-center justify-center gap-3 my-2 text-xs font-mono">
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                    2018 (Adán y Eva)
                  </span>
                  <span className="text-slate-500">→</span>
                  <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-amber-300 font-bold">
                    2022 (Quédate - BZRP)
                  </span>
                </div>
                <p className="text-slate-300 text-xs">
                  Ahora suena <strong>Canguro de WOS (2019)</strong>. Tienes 3 opciones:
                </p>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  <li><span className="text-rose-400">Antes de 2018:</span> Fallo ❌</li>
                  <li><span className="text-emerald-400 font-bold">Entre 2018 y 2022:</span> ¡Acierto! ✔️ (2019 queda perfectamente en medio).</li>
                  <li><span className="text-rose-400">Después de 2022:</span> Fallo ❌</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border bg-slate-800/50 border-slate-700">
                <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  ¿Qué pasa si dos canciones son del mismo año?
                </h4>
                <p className="text-xs text-slate-300">
                  ¡No te preocupes! Si colocas una canción de 2021 junto a otra que también es de 2021, el juego lo considera automáticamente un <strong>acierto válido</strong> sin penalizarte.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-800/40">
                  <h4 className="font-semibold text-white text-sm mb-1">👵 Para los Mayores</h4>
                  <p className="text-xs text-slate-400">
                    No te preocupes por recordar fechas exactas. Piensa en eventos o etapas: ¿esto sonaba antes o después de la pandemia? ¿en qué año se hizo famosa esa sesión?
                  </p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-700/60 bg-slate-800/40">
                  <h4 className="font-semibold text-white text-sm mb-1">👦 Para los Jóvenes</h4>
                  <p className="text-xs text-slate-400">
                    Presta atención a la evolución del sonido: los primeros temas de trap sonaban más crudos (2017-2018), mientras que los lanzamientos recientes tienen ritmos más electrónicos o fusiones pop.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border bg-amber-950/20 border-amber-800/30">
                <h4 className="font-semibold text-amber-300 text-sm mb-1 flex items-center gap-2">
                  🛡️ Modo Cero Estrés
                </h4>
                <p className="text-xs text-slate-300">
                  Si tocas la pantalla o actualizas por error, tu partida se mantendrá intacta. Además, puedes pausar y volver a reproducir el audio tantas veces como necesites durante tu turno.
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
            className="px-6 py-2.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2"
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
