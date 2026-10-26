import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Disc3, Music2 } from 'lucide-react';

export default function AudioPlayer({ audioUrl, isRevealed, artwork, title, artist, year }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    // Reset cuando cambia el audio
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioUrl) {
        audioRef.current.load();
        // Intentar auto-play al recibir nueva canción
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((e) => {
              console.log('Autoplay bloqueado por el navegador (requiere interacción táctil):', e);
              setIsPlaying(false);
            });
        }
      }
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.error('Error al reproducir audio:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => setIsPlaying(true));
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-2">
      <audio
        ref={audioRef}
        src={audioUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        preload="auto"
      />

      {/* Disco de Vinilo Giratorio */}
      <div className="relative group cursor-pointer my-2" onClick={togglePlay}>
        {/* Halo resplandeciente cuando suena */}
        <div 
          className={`absolute -inset-2 rounded-full transition-all duration-700 blur-xl ${
            isPlaying ? 'opacity-80 scale-105' : 'opacity-20 scale-95'
          }`}
          style={{
            background: isRevealed 
              ? 'radial-gradient(circle, var(--color-success), transparent 70%)'
              : 'radial-gradient(circle, var(--color-primary), transparent 70%)'
          }}
        />

        {/* Disco de vinilo físico */}
        <div 
          className={`relative w-44 h-44 sm:w-52 sm:h-52 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-900 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 transition-transform ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
          style={{
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Surcos del vinilo concéntricos */}
          <div className="absolute inset-2 rounded-full border border-slate-800/60 pointer-events-none" />
          <div className="absolute inset-6 rounded-full border border-slate-800/40 pointer-events-none" />
          <div className="absolute inset-10 rounded-full border border-slate-800/50 pointer-events-none" />
          <div className="absolute inset-14 rounded-full border border-slate-800/30 pointer-events-none" />

          {/* Etiqueta central del vinilo */}
          <div 
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden flex items-center justify-center relative shadow-inner border-2 border-slate-700"
            style={{
              backgroundColor: isRevealed ? 'transparent' : 'var(--color-bg-surface-elevated)'
            }}
          >
            {isRevealed && artwork ? (
              <img 
                src={artwork} 
                alt={title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-1">
                <Disc3 className={`w-8 h-8 ${isPlaying ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">
                  Misterio
                </span>
              </div>
            )}

            {/* Agujero central del vinilo */}
            <div className="absolute w-4 h-4 rounded-full bg-slate-950 border border-slate-700 shadow-md" />
          </div>
        </div>

        {/* Botón flotante central de Play / Pause */}
        <button
          className="absolute inset-0 m-auto w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 bg-black/60 backdrop-blur-sm text-white border border-white/20"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
        </button>
      </div>

      {/* Barra de progreso de la pista de 30 segundos */}
      <div className="w-full max-w-xs mt-3 space-y-1.5">
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/50">
          <div 
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: isRevealed ? 'var(--color-success)' : 'var(--color-primary)',
              boxShadow: isPlaying ? 'var(--shadow-glow-primary)' : 'none'
            }}
          />
        </div>

        {/* Tiempos y Controles */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span>{Math.floor(currentTime)}s</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRestart}
              className="p-1 hover:text-white transition-colors"
              title="Reiniciar fragmento"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={toggleMute}
              className="p-1 hover:text-white transition-colors"
              title={isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
          <span>{Math.floor(duration)}s</span>
        </div>
      </div>

      {/* Info si ya está revelada */}
      {isRevealed && (
        <div className="mt-2 text-center animate-fadeIn">
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-sm font-medium text-slate-400">{artist}</p>
          <span 
            className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-black tracking-widest text-white shadow-md"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {year}
          </span>
        </div>
      )}

      {/* Mensaje de aviso si no hay audio o falló la conexión */}
      {hasError && (
        <p className="text-xs text-rose-400 mt-2 text-center">
          Audio no disponible para esta pista. Puedes jugar deduciendo con el título si lo revelas.
        </p>
      )}
    </div>
  );
}
