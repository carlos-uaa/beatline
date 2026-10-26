import React from 'react';
import { Plus, Check, Disc, Ban } from 'lucide-react';

export default function Timeline({ 
  cards = [], 
  selectedIndex, 
  onSelectSlot, 
  isRevealed, 
  isRoundCorrect = false,
  correctSlotIndex,
  eliminatedSlots = [], // Índices de ranuras descartadas por Pista 2
  highlightTrackId = null // ID de la carta ganada este turno para resaltarla
}) {
  return (
    <div className="w-full py-2 overflow-x-auto select-none">
      <div className="flex items-center justify-start min-w-max px-4 sm:px-6 py-3 gap-2.5 mx-auto">
        
        {/* Ranura 0: Antes de la primera carta */}
        <SlotButton
          index={0}
          isSelected={selectedIndex === 0}
          isCorrect={isRevealed && !isRoundCorrect && correctSlotIndex === 0}
          isWrong={isRevealed && !isRoundCorrect && selectedIndex === 0}
          isEliminated={eliminatedSlots.includes(0)}
          disabled={isRevealed || eliminatedSlots.includes(0)}
          onClick={() => onSelectSlot(0)}
          label="Antes de todo"
        />

        {cards.map((card, idx) => {
          const isNewlyAdded = isRevealed && isRoundCorrect && card.id === highlightTrackId;
          return (
            <React.Fragment key={card.id || `${card.title}-${idx}`}>
              {/* Carta del jugador en su línea de tiempo */}
              <div 
                className={`relative w-32 h-44 sm:w-40 sm:h-52 rounded-2xl p-2.5 flex flex-col justify-between border shadow-lg transition-transform duration-300 ${
                  isNewlyAdded 
                    ? 'ring-4 ring-emerald-500/50 border-emerald-400 scale-105 shadow-emerald-500/20' 
                    : ''
                }`}
                style={{
                  backgroundColor: 'var(--color-bg-card)',
                  borderColor: isNewlyAdded ? '#34d399' : 'var(--border-subtle)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {/* Encabezado con año oficial y badge si es recién ganada */}
                <div className="flex items-center justify-between">
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-black tracking-widest text-slate-950 font-mono shadow-sm"
                    style={{ backgroundColor: isNewlyAdded ? '#34d399' : 'var(--color-accent)' }}
                  >
                    {card.year}
                  </span>
                  {isNewlyAdded ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-emerald-400 text-slate-950 font-mono shadow-sm animate-pulse">
                      ¡Ganada!
                    </span>
                  ) : (
                    <Disc className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                {/* Portada */}
                <div className="relative w-full h-20 sm:h-24 rounded-xl overflow-hidden my-1 bg-slate-900 border border-slate-800">
                  <img
                    src={card.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80'}
                    alt={card.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Título y Artista */}
                <div className="text-left overflow-hidden">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate" title={card.title}>
                    {card.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate" title={card.artist}>
                    {card.artist}
                  </p>
                </div>
              </div>

              {/* Ranura entre esta carta y la siguiente */}
              <SlotButton
                index={idx + 1}
                isSelected={selectedIndex === idx + 1}
                isCorrect={isRevealed && !isRoundCorrect && correctSlotIndex === idx + 1}
                isWrong={isRevealed && !isRoundCorrect && selectedIndex === idx + 1}
                isEliminated={eliminatedSlots.includes(idx + 1)}
                disabled={isRevealed || eliminatedSlots.includes(idx + 1)}
                onClick={() => onSelectSlot(idx + 1)}
                label={
                  idx === cards.length - 1 
                    ? "Después de todo" 
                    : `Entre ${card.year} y ${cards[idx + 1]?.year || '...'}`
                }
              />
            </React.Fragment>
          );
        })}

        {cards.length === 0 && (
          <div className="flex items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-700 text-slate-400 text-xs sm:text-sm max-w-sm">
            <p className="text-center">
              Esta es tu primera canción. Toca el botón central para colocarla como base de tu línea de tiempo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotButton({ index, isSelected, isCorrect, isWrong, isEliminated, disabled, onClick, label }) {
  if (isEliminated) {
    return (
      <div 
        className="flex flex-col items-center justify-center w-20 h-36 sm:w-26 sm:h-44 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/40 p-2 opacity-35 cursor-not-allowed"
        title="Descartada por la Pista 2"
      >
        <Ban className="w-5 h-5 text-slate-600 mb-1" />
        <span className="text-[9px] text-center font-bold text-slate-600">Descartada</span>
      </div>
    );
  }

  let styleClasses = "border-dashed border-slate-700 hover:border-violet-400 text-slate-400 hover:text-white bg-slate-900/40";
  
  if (isSelected) {
    styleClasses = "border-solid border-violet-500 bg-violet-950/60 text-violet-300 ring-4 ring-violet-500/20 scale-105";
  }

  if (isCorrect) {
    styleClasses = "border-solid border-emerald-500 bg-emerald-950/70 text-emerald-300 ring-4 ring-emerald-500/30 scale-105 animate-bounce";
  } else if (isWrong) {
    styleClasses = "border-solid border-rose-500 bg-rose-950/60 text-rose-300 ring-4 ring-rose-500/20";
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col items-center justify-center w-22 h-38 sm:w-26 sm:h-44 rounded-2xl border-2 transition-all duration-200 cursor-pointer p-2 active:scale-95 group ${styleClasses}`}
      aria-label={`Insertar aquí: ${label}`}
    >
      <div className={`p-1.5 rounded-full mb-1 transition-transform group-hover:scale-110 ${
        isSelected ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
      }`}>
        {isCorrect ? (
          <Check className="w-4 h-4 text-white" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
      </div>
      <span className="text-[10px] text-center font-semibold leading-tight line-clamp-2 px-1">
        {isCorrect ? '¡Aquí era!' : isWrong ? 'Fallaste aquí' : isSelected ? 'Elegido' : 'Colocar aquí'}
      </span>
      <span className="text-[9px] text-slate-500 text-center mt-0.5 font-mono">
        {label}
      </span>
    </button>
  );
}
