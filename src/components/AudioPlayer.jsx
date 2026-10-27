import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Disc3, Eye, RefreshCw, AlertCircle } from 'lucide-react';

export default function AudioPlayer({ 
  audioUrl, 
  isRevealed, 
  artwork, 
  title, 
  artist, 
  year,
  maxDuration = null, // Para el evento "Intro Relámpago (5s)"
  blurredArtwork = false, // Para Pista 1 comodín
  artistHint = null, // Ej. "D... (2020s)"
  isUrgentTimer = false, // Parpadeo cuando quedan <= 10s
  onPlaybackStart = null, // Callback cuando inicia la reproducción para activar timer
  onSkipBrokenTrack = null // Callback para saltar gratis si el audio no se puede reproducir
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      if (audioUrl) {
        audioRef.current.load();
        // Iniciar pausado por defecto para evitar spoilers mientras debaten o pasan la tablet
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
        .then(() => {
          setIsPlaying(true);
          if (onPlaybackStart) onPlaybackStart();
        })
        .catch(() => {
          setIsPlaying(false);
        });
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlaying(true);
      if (onPlaybackStart) onPlaybackStart();
    });
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      setCurrentTime(cur);

      // Si el evento limita la duración (ej. 5 segundos)
      if (maxDuration && cur >= maxDuration) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
        return;
      }

      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(maxDuration ? maxDuration : audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const effectiveDuration = maxDuration || duration || 30;
  const progressPercent = effectiveDuration > 0 ? (currentTime / effectiveDuration) * 100 : 0;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto my-1">
      <audio
        ref={audioRef}
        src={audioUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => {
          setHasError(true);
          setIsPlaying(false);
        }}
        preload="auto"
      />

      {/* Disco de Vinilo Giratorio */}
      <div className="relative group cursor-pointer my-1" onClick={togglePlay}>
        {/* Halo resplandeciente cuando suena o cuando el reloj apremia */}
        <div 
          className={`absolute -inset-2 rounded-full transition-all duration-700 blur-xl ${
            isUrgentTimer 
              ? 'opacity-90 scale-105 animate-pulse bg-rose-500' 
              : isPlaying 
              ? 'opacity-80 scale-105' 
              : 'opacity-20 scale-95'
          }`}
          style={{
            background: isUrgentTimer
              ? 'radial-gradient(circle, #f43f5e, transparent 70%)'
              : isRevealed 
              ? 'radial-gradient(circle, var(--color-success), transparent 70%)'
              : 'radial-gradient(circle, var(--color-primary), transparent 70%)'
          }}
        />

        {/* Disco de vinilo físico */}
        <div 
          className={`relative w-40 h-40 sm:w-48 sm:h-48 rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-900 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 transition-transform ${
            isPlaying ? 'animate-spin-slow' : ''
          }`}
          style={{
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          {/* Surcos concéntricos */}
          <div className="absolute inset-2 rounded-full border border-slate-800/60 pointer-events-none" />
          <div className="absolute inset-5 rounded-full border border-slate-800/40 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-slate-800/50 pointer-events-none" />
          <div className="absolute inset-12 rounded-full border border-slate-800/30 pointer-events-none" />

          {/* Etiqueta central del vinilo */}
          <div 
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-full overflow-hidden flex items-center justify-center relative shadow-inner border-2 border-slate-700"
            style={{
              backgroundColor: isRevealed ? 'transparent' : 'var(--color-bg-surface-elevated)'
            }}
          >
            {isRevealed && artwork ? (
              <img 
                src={artwork} 
                alt={title} 
                className="w-full h-full object-cover animate-fadeIn"
              />
            ) : blurredArtwork && artwork ? (
              /* Pista Comodín: Portada desenfocada */
              <div className="relative w-full h-full overflow-hidden">
                <img 
                  src={artwork} 
                  alt="" 
                  className="w-full h-full object-cover blur-md scale-125 filter"
                />
                <div className="absolute inset-0 bg-violet-950/40 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-300" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-1">
                <Disc3 className={`w-7 h-7 ${isPlaying ? 'text-violet-400' : 'text-slate-500'}`} />
                <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 mt-0.5">
                  Misterio
                </span>
              </div>
            )}

            {/* Agujero central del vinilo */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-700 shadow-md pointer-events-none" />
          </div>
        </div>

        {/* Botón flotante central de Play / Pause */}
        <button
          className="keep-white absolute inset-0 m-auto w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 bg-black/60 backdrop-blur-sm text-white border border-white/20"
          aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
        </button>
      </div>

      {/* Botón táctil para reproducir manualmente sin spoiler */}
      {!isRevealed && (
        <button
          type="button"
          onClick={togglePlay}
          className={`mt-2 px-5 py-2 rounded-full font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl transition-all transform active:scale-95 cursor-pointer ${
            isPlaying
              ? 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
              : 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white hover:brightness-110 shadow-violet-500/30 animate-pulse'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pausar Música</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white ml-0.5" />
              <span>▶️ Reproducir Canción</span>
            </>
          )}
        </button>
      )}

      {/* Pista textual de artista si está activa (Pista 1 o evento gratis) */}
      {!isRevealed && artistHint && (
        <div className="mt-1 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
          <span>💡 Pista:</span>
          <span>{artistHint}</span>
        </div>
      )}

      {/* Barra de progreso */}
      <div className="w-full max-w-xs mt-2 space-y-1">
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative border border-slate-700/50">
          <div 
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: maxDuration ? '#8b5cf6' : isRevealed ? 'var(--color-success)' : 'var(--color-primary)',
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
          <span>{maxDuration ? `${maxDuration}s (Intro)` : `${Math.floor(duration)}s`}</span>
        </div>
      </div>

      {/* Info si ya está revelada */}
      {isRevealed && (
        <div className="mt-2 text-center animate-fadeIn">
          <h3 className="font-bold text-lg text-white">{title}</h3>
          <p className="text-sm font-medium text-slate-400">{artist}</p>
          <span 
            className="keep-white inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-black tracking-widest text-white shadow-md"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            {year}
          </span>
        </div>
      )}

      {hasError && !isRevealed && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-center space-y-2 animate-fadeIn max-w-xs shadow-lg">
          <div className="flex items-center justify-center gap-1.5 text-xs text-rose-300 font-bold">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Audio no disponible en esta pista</span>
          </div>
          {onSkipBrokenTrack && (
            <button
              type="button"
              onClick={onSkipBrokenTrack}
              className="w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
              title="Cambia a la siguiente canción sin costo ni penalización"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Cambiar Canción Gratis (0 ⚡)</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
