import React, { useState } from 'react';
import { 
  BookOpen, 
  X, 
  Play, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Zap, 
  Lightbulb, 
  Dices, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

export default function InstructionsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
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
          className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--color-bg-surface-elevated)' }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl"
              style={{ backgroundColor: 'var(--color-primary-hover)', color: '#fff' }}
            >
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">Manual del Juego</h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Reglas, Pistas Comodín, Fichas ⚡ y Giros Sorpresa
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Cerrar instrucciones"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b px-4 sm:px-6 gap-2 pt-2 overflow-x-auto" style={{ borderColor: 'var(--border-subtle)' }}>
          <button
            onClick={() => setActiveTab('rules')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'border-violet-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            El Turno
          </button>
          <button
            onClick={() => setActiveTab('hints')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'hints'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            Pistas (0.5 ⚡)
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'events'
                ? 'border-pink-500 text-pink-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Dices className="w-3.5 h-3.5 text-pink-400" />
            Giros Sorpresa 🎲
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tokens'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Fichas ⚡ y Robo
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-200 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl border bg-violet-950/30 border-violet-800/40">
                <h3 className="font-bold text-violet-300 text-sm sm:text-base mb-1 flex items-center gap-2">
                  <Award className="w-4 h-4 text-violet-400" />
                  Mecánica Familiar
                </h3>
                <p className="text-slate-300 text-xs">
                  Gana el primer jugador en juntar la meta de canciones (ej. 10 cartas) en su línea del tiempo cronológica.
                </p>
              </div>

              <ol className="space-y-2.5 list-decimal list-inside pl-1 text-slate-300 text-xs sm:text-sm">
                <li>
                  <strong>Escucha y di la canción en voz alta:</strong> Suena el clip de audio. El jugador en turno intenta adivinar el nombre o el artista.
                </li>
                <li>
                  <strong>¿Tienes dudas? ¡Usa Pistas Comodín!:</strong> Puedes pagar <strong>0.5 ⚡</strong> para ver la inicial del artista o descartar el 50% de las ranuras erróneas.
                </li>
                <li>
                  <strong>¿No te la sabes? ¡Robo de Turno!:</strong> Cualquier otro familiar puede pagar 1 ficha ⚡ para robar el turno y acomodarla en su propio tablero.
                </li>
                <li>
                  <strong>¡Revela la Carta!:</strong> Si acertaste la posición relativa, te quedas la carta. Si además dijiste bien el título y artista antes de voltear, ganas <strong>+1 Ficha ⚡</strong>.
                </li>
              </ol>

              <div className="p-3 rounded-xl border bg-slate-800/50 border-slate-700 text-xs">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Niveles de Dificultad
                </h4>
                <p className="text-slate-400">
                  • <strong>🎯 Clásica:</strong> Orden cronológico exacto.<br />
                  • <strong>🌱 Relajada:</strong> Otorga margen de error de <strong>±2 años</strong> si dudas entre cartas muy cercanas (ideal para abuelos o niños).<br />
                  • <strong>🔥 Experto:</strong> Sin margen de error y comienzas con solo 1 ficha ⚡.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'hints' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl border bg-amber-950/30 border-amber-700/40">
                <h3 className="font-bold text-amber-300 text-sm sm:text-base mb-1 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Pistas Comodín (Costo: Media Ficha 0.5 ⚡)
                </h3>
                <p className="text-slate-300 text-xs">
                  Diseñadas para nivelar la partida y evitar que nadie se frustre si le toca una canción que no recuerda del todo.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-amber-300 block mb-1">
                    💡 Pista 1: Artista + Década + Portada Borrosa (0.5 ⚡)
                  </strong>
                  <p className="text-slate-400">
                    Desenfoca la portada del vinilo para que puedas ver los colores y formas del álbum, y muestra en pantalla la <strong>primera letra del artista</strong> y la <strong>década</strong> en que salió (ej. <em>"Artista empieza con D... • Lanzada en los 2010s"</em>).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-cyan-300 block mb-1">
                    💡 Pista 2: Descartar Ranuras Incorrectas (0.5 ⚡)
                  </strong>
                  <p className="text-slate-400">
                    Elimina y tacha de tu línea del tiempo el <strong>50% de las opciones erróneas</strong>, dejándote solo la ranura correcta y alguna vecina para que sea mucho más fácil acertar.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl border bg-pink-950/30 border-pink-700/40">
                <h3 className="font-bold text-pink-300 text-sm sm:text-base mb-1 flex items-center gap-2">
                  <Dices className="w-4 h-4 text-pink-400" />
                  Giros de Tuerca y Eventos Sorpresa (Probabilidad Configurable)
                </h3>
                <p className="text-slate-300 text-xs">
                  Para que nadie se confíe aunque lleve ventaja, cada turno tiene una probabilidad configurable (por defecto 20%, ~1 de cada 5 rondas) de activar un evento sorpresa. Si te parece muy difícil, puedes tocar <strong>"Cambiar Evento (1 ⚡)"</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-orange-400 block mb-0.5">🔥 Doble o Nada</strong>
                  <p className="text-slate-400">Si aciertas, ¡ganas 2 cartas! Si fallas, pierdes 0.5 ⚡.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-violet-400 block mb-0.5">🤫 Intro Relámpago (5s)</strong>
                  <p className="text-slate-400">Solo suenan 5 segundos. Si aciertas, te llevas la carta + 1 ⚡ extra.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-yellow-400 block mb-0.5">⚡ Fiebre de Fichas</strong>
                  <p className="text-slate-400">Acertar la posición en este turno te regala +1.5 ⚡ Fichas.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-cyan-400 block mb-0.5">🛡️ Escudo Protector</strong>
                  <p className="text-slate-400">Inmunidad de ±3 años respecto a la carta más cercana.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-emerald-400 block mb-0.5">🎁 Pista Gratis</strong>
                  <p className="text-slate-400">La tablet te obsequia la Pista 1 (Artista + Portada) gratis.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-rose-400 block mb-0.5">🕵️ Robo con Descuento</strong>
                  <p className="text-slate-400">Robar esta canción solo cuesta 0.5 ⚡ fichas.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-sky-400 block mb-0.5">🌧️ Lluvia de Fichas</strong>
                  <p className="text-slate-400">¡Ronda solidaria! Todos los jugadores reciben +1 ⚡ Ficha.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-teal-400 block mb-0.5">⏳ Salto Temporal</strong>
                  <p className="text-slate-400">Pista 2 gratis: se descartan el 50% de las ranuras erróneas.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-purple-400 block mb-0.5">🎯 Año Exacto (+2 ⚡)</strong>
                  <p className="text-slate-400">Si además de la ranura dices el año exacto, ganas +2 ⚡.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-green-400 block mb-0.5">🔄 Segunda Oportunidad</strong>
                  <p className="text-slate-400">Si fallas la ranura en el 1º intento, tienes un 2º intento gratis.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-amber-400 block mb-0.5">🤝 Dúo Musical</strong>
                  <p className="text-slate-400">Pide ayuda a otro jugador; si aciertan, ambos ganan +0.5 ⚡.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tokens' && (
            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl border bg-amber-950/30 border-amber-700/40">
                <h3 className="font-bold text-amber-300 text-sm sm:text-base mb-1 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Economía de Fichas BeatLine (⚡)
                </h3>
                <p className="text-xs text-slate-300">
                  Las fichas se pueden acumular hasta un máximo de 5 ⚡ y se gastan estratégicamente.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-white block mb-0.5">🎤 Ganar Fichas (+1 ⚡)</strong>
                  Adivina en voz alta el nombre de la canción y el artista antes de voltear la carta.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-white block mb-0.5">⚡ Robar Turno (1 ⚡)</strong>
                  Tómale la delantera a un rival si no reconoce la canción que le tocó.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-white block mb-0.5">💡 Pedir Pistas (0.5 ⚡)</strong>
                  Usa media ficha para ver el artista/década o descartar la mitad de los errores.
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700">
                  <strong className="text-white block mb-0.5">🎁 Canjear Carta Directa (3 ⚡)</strong>
                  Compra una carta ganada segura sin arriesgarte a fallar.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pie del modal */}
        <div
          className="px-5 py-3 border-t flex justify-end"
          style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--color-bg-surface-elevated)' }}
        >
          <button
            onClick={onClose}
            className="keep-white px-5 py-2 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-primary)',
              boxShadow: 'var(--shadow-glow-primary)'
            }}
          >
            ¡Listo, a jugar!
          </button>
        </div>
      </div>
    </div>
  );
}
