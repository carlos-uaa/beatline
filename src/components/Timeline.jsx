import React from 'react';
import { Plus, ArrowLeftRight, Check, Disc } from 'lucide-react';

export default function Timeline({ 
  cards = [], 
  selectedIndex, 
  onSelectSlot, 
  isRevealed, 
  correctSlotIndex 
}) {
  return (
    <div className="w-full py-4 overflow-x-auto select-none">
      <div className="flex items-center justify-start min-w-max px-6 py-4 gap-3 mx-auto">
        
        {/* Ranura 0: Antes de la primera carta */}
        <SlotButton
          index={0}
          isSelected={selectedIndex === 0}
          isCorrect={isRevealed && correctSlotIndex === 0}
          isWrong={isRevealed && selectedIndex === 0 && correctSlotIndex !== 0}
          disabled={isRevealed}
          onClick={() => onSelectSlot(0)}
          label="Antes de todo"
        />

        {cards.map((card, idx) => (
          <React.Fragment key={card.id || `${card.title}-${idx}`}>
            {/* Carta del jugador en su línea de tiempo */}
            <div 
              className="relative w-36 h-48 sm:w-44 sm:h-56 rounded-2xl p-2.5 flex flex-col justify-between border shadow-lg transition-transform duration-300"
              style={{
                backgroundColor: 'var(--color-bg-card)',
                borderColor: 'var(--border-subtle)',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {/* Encabezado de la carta con el año oficial */}
              <div className="flex items-center justify-between">
                <span 
                  className="px-2.5 py-0.5 rounded-full text-xs font-black tracking-widest text-slate-950 font-mono shadow-sm"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  {card.year}
                </span>
                <Disc className="w-4 h-4 text-slate-500" />
              </div>

              {/* Portada */}
              <div className="relative w-full h-24 sm:h-28 rounded-xl overflow-hidden my-1 bg-slate-900 border border-slate-800">
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
              isCorrect={isRevealed && correctSlotIndex === idx + 1}
              isWrong={isRevealed && selectedIndex === idx + 1 && correctSlotIndex !== idx + 1}
              disabled={isRevealed}
              onClick={() => onSelectSlot(idx + 1)}
              label={
                idx === cards.length - 1 
                  ? "Después de todo" 
                  : `Entre ${card.year} y ${cards[idx + 1]?.year || '...'}`
              }
            />
          </React.Fragment>
        ))}

        {cards.length === 0 && (
          <div className="flex items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-700 text-slate-400 text-sm max-w-sm">
            <p className="text-center">
              Esta es tu primera canción. Toca el botón central para colocarla como la base de tu línea de tiempo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SlotButton({ index, isSelected, isCorrect, isWrong, disabled, onClick, label }) {
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
      className={`relative flex flex-col items-center justify-center w-24 h-40 sm:w-28 sm:h-48 rounded-2xl border-2 transition-all duration-200 cursor-pointer p-2 active:scale-95 group ${styleClasses}`}
      aria-label={`Insertar aquí: ${label}`}
    >
      <div className={`p-2 rounded-full mb-1 transition-transform group-hover:scale-110 ${
        isSelected ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400'
      }`}>
        {isCorrect ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <Plus className="w-5 h-5" />
        )}
      </div>
      <span className="text-[10px] text-center font-semibold leading-tight line-clamp-2 px-1">
        {isCorrect ? '¡Aquí era!' : isWrong ? 'Fallaste aquí' : isSelected ? 'Elegido' : 'Colocar aquí'}
      </span>
      <span className="text-[9px] text-slate-500 text-center mt-1 font-mono">
        {label}
      </span>
    </button>
  );
}
