import React, { useState, useEffect, useCallback } from 'react';
import { 
  BookOpen, 
  RotateCcw, 
  Trophy, 
  Volume2, 
  Sparkles, 
  Check, 
  X, 
  ArrowRight, 
  Disc, 
  Users, 
  AlertTriangle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

import PlayerSetup from './components/PlayerSetup';
import InstructionsModal from './components/InstructionsModal';
import AudioPlayer from './components/AudioPlayer';
import Timeline from './components/Timeline';
import GameOverModal from './components/GameOverModal';

import { URBAN_ARGENTINA_PLAYLIST } from './data/urbanArgentina';
import { enrichTrack } from './services/musicService';
import { 
  saveGameSession, 
  loadGameSession, 
  clearGameSession, 
  hasActiveSession 
} from './services/gameStorage';

export default function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'gameover'
  const [players, setPlayers] = useState([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [deck, setDeck] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctSlotIndex, setCorrectSlotIndex] = useState(null);
  const [targetCards, setTargetCards] = useState(10);
  const [winner, setWinner] = useState(null);

  const [showInstructions, setShowInstructions] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Comprobar si existe una partida previa guardada al cargar
  useEffect(() => {
    if (hasActiveSession()) {
      setHasSavedGame(true);
    }
  }, []);

  // Guardado automático continuo en localStorage
  useEffect(() => {
    if (gameState === 'playing' && players.length > 0) {
      saveGameSession({
        gameState,
        players,
        activePlayerIndex,
        deck,
        currentTrack,
        selectedSlot,
        isRevealed,
        isCorrect,
        correctSlotIndex,
        targetCards,
        winner
      });
    }
  }, [gameState, players, activePlayerIndex, deck, currentTrack, selectedSlot, isRevealed, isCorrect, correctSlotIndex, targetCards, winner]);

  // Reanudar partida guardada
  const handleResumeGame = () => {
    const saved = loadGameSession();
    if (saved) {
      setPlayers(saved.players || []);
      setActivePlayerIndex(saved.activePlayerIndex || 0);
      setDeck(saved.deck || []);
      setCurrentTrack(saved.currentTrack || null);
      setSelectedSlot(saved.selectedSlot !== undefined ? saved.selectedSlot : null);
      setIsRevealed(saved.isRevealed || false);
      setIsCorrect(saved.isCorrect !== undefined ? saved.isCorrect : null);
      setCorrectSlotIndex(saved.correctSlotIndex !== undefined ? saved.correctSlotIndex : null);
      setTargetCards(saved.targetCards || 10);
      setWinner(saved.winner || null);
      setGameState('playing');
      setHasSavedGame(false);
    }
  };

  // Barajar array (Fisher-Yates)
  const shuffleDeck = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Iniciar nueva partida
  const handleStartGame = async ({ players: initialPlayers, targetCards: target, playlistId }) => {
    const shuffled = shuffleDeck(URBAN_ARGENTINA_PLAYLIST.tracks);

    // Repartir 1 carta inicial a cada jugador como base de su línea de tiempo
    const preparedPlayers = [];
    let currentDeck = [...shuffled];

    for (let p of initialPlayers) {
      const initialTrack = currentDeck.pop();
      // Enriquecer la carta inicial con portada y año oficial
      const enriched = await enrichTrack(initialTrack);
      preparedPlayers.push({
        ...p,
        cards: [enriched]
      });
    }

    setPlayers(preparedPlayers);
    setTargetCards(target);
    setActivePlayerIndex(0);
    setGameState('playing');
    setWinner(null);
    clearGameSession();

    // Preparar el primer turno
    await prepareNextTurn(currentDeck, 0);
  };

  // Preparar el siguiente turno
  const prepareNextTurn = async (remainingDeck, nextPlayerIndex) => {
    setSelectedSlot(null);
    setIsRevealed(false);
    setIsCorrect(null);
    setCorrectSlotIndex(null);

    // Si se agota el mazo, rebarajar descartes o la lista completa
    let deckToUse = [...remainingDeck];
    if (deckToUse.length === 0) {
      deckToUse = shuffleDeck(URBAN_ARGENTINA_PLAYLIST.tracks);
    }

    const nextTrack = deckToUse.pop();
    setDeck(deckToUse);
    setActivePlayerIndex(nextPlayerIndex);

    // Enriquecer audio en segundo plano
    setIsEnriching(true);
    const enriched = await enrichTrack(nextTrack);
    setCurrentTrack(enriched);
    setIsEnriching(false);
  };

  // Validar colocación de la carta en la línea del tiempo
  const handleReveal = () => {
    if (selectedSlot === null || !currentTrack) return;

    const currentPlayer = players[activePlayerIndex];
    const cards = currentPlayer.cards || [];

    // Calcular el rango válido para insertar
    // Si cards está vacío, siempre es válido
    let valid = true;

    // Verificar si es mayor o igual que la carta anterior
    if (selectedSlot > 0) {
      const prevCard = cards[selectedSlot - 1];
      if (currentTrack.year < prevCard.year) {
        valid = false;
      }
    }

    // Verificar si es menor o igual que la carta siguiente
    if (selectedSlot < cards.length) {
      const nextCard = cards[selectedSlot];
      if (currentTrack.year > nextCard.year) {
        valid = false;
      }
    }

    // Encontrar dónde correspondía realmente
    let realIndex = 0;
    while (realIndex < cards.length && cards[realIndex].year <= currentTrack.year) {
      realIndex++;
    }

    setIsCorrect(valid);
    setCorrectSlotIndex(realIndex);
    setIsRevealed(true);

    if (valid) {
      // Disparar confeti sutil de acierto
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (e) {}

      // Insertar carta en la línea del tiempo manteniendo el orden
      const updatedCards = [...cards];
      updatedCards.splice(selectedSlot, 0, currentTrack);

      const updatedPlayers = [...players];
      updatedPlayers[activePlayerIndex] = {
        ...currentPlayer,
        cards: updatedCards,
        score: updatedCards.length
      };
      setPlayers(updatedPlayers);

      // Verificar si ganó la partida
      if (updatedCards.length >= targetCards) {
        setWinner(currentPlayer);
        setTimeout(() => {
          setGameState('gameover');
          clearGameSession();
        }, 1800);
      }
    }
  };

  // Pasar al siguiente turno
  const handleNextTurn = () => {
    const nextIndex = (activePlayerIndex + 1) % players.length;
    prepareNextTurn(deck, nextIndex);
  };

  // Reiniciar partida
  const handleResetGame = () => {
    clearGameSession();
    setGameState('setup');
    setShowResetConfirm(false);
    setCurrentTrack(null);
  };

  const currentPlayer = players[activePlayerIndex] || {};

  return (
    <div className="min-h-screen flex flex-col justify-between select-none relative overflow-x-hidden">
      
      {/* Barra Superior / Header */}
      <header 
        className="w-full px-4 sm:px-8 py-3.5 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-40"
        style={{
          backgroundColor: 'var(--color-bg-glass)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-tr from-violet-600 to-cyan-500 text-white"
          >
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-white leading-tight">
              BeatLine
            </h1>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-1 font-mono">
              Edición Urbano Argentino 🇦🇷
            </span>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          {/* Botón de Cómo Jugar */}
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all active:scale-95"
            title="Ver instrucciones del juego"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span className="hidden sm:inline">Cómo Jugar</span>
          </button>

          {/* Botón de Reiniciar si está jugando */}
          {gameState === 'playing' && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-950/30 border border-slate-700/40 transition-colors"
              title="Reiniciar partida"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* CONTENIDO SEGÚN ESTADO */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 py-4 max-w-6xl mx-auto">
        {gameState === 'setup' && (
          <PlayerSetup 
            onStartGame={handleStartGame} 
            hasSavedGame={hasSavedGame}
            onResumeGame={handleResumeGame}
          />
        )}

        {gameState === 'playing' && currentTrack && (
          <div className="w-full flex flex-col items-center space-y-4 animate-fadeIn">
            
            {/* Banner de Jugador en Turno */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-md"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  #{activePlayerIndex + 1}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Turno actual
                  </span>
                  <h2 className="text-lg font-black text-white">{currentPlayer.name}</h2>
                </div>
              </div>

              {/* Progreso de canciones hacia la meta */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Objetivo</span>
                  <span className="text-xs font-bold text-amber-400">
                    {currentPlayer.cards?.length || 0} / {targetCards} cartas
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Trophy className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Zona Central: Reproductor de Audio y Tarjeta Misteriosa */}
            <AudioPlayer 
              audioUrl={currentTrack.previewUrl}
              isRevealed={isRevealed}
              artwork={currentTrack.artwork}
              title={currentTrack.title}
              artist={currentTrack.artist}
              year={currentTrack.year}
            />

            {/* Acciones de Revelar / Pasar Turno */}
            <div className="flex items-center justify-center gap-3 my-2">
              {!isRevealed ? (
                <button
                  onClick={handleReveal}
                  disabled={selectedSlot === null || isEnriching}
                  className="px-8 py-3.5 rounded-2xl font-black text-base text-white shadow-xl transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: selectedSlot !== null ? 'var(--color-primary)' : 'var(--color-bg-surface-elevated)',
                    boxShadow: selectedSlot !== null ? 'var(--shadow-glow-primary)' : 'none'
                  }}
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  {selectedSlot === null ? 'Selecciona una ranura abajo' : '¡Revelar Carta!'}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div 
                    className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-sm font-bold ${
                      isCorrect 
                        ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300' 
                        : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <Check className="w-5 h-5" /> ¡Correcto! La carta se suma a tu colección
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5" /> ¡Incorrecto! La carta era de {currentTrack.year}
                      </>
                    )}
                  </div>

                  <button
                    onClick={handleNextTurn}
                    className="px-6 py-3 rounded-2xl font-black text-sm text-slate-950 transition-transform active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer"
                    style={{ backgroundColor: 'var(--color-accent)' }}
                  >
                    Siguiente Turno <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Zona Inferior: Línea de Tiempo del Jugador Activo */}
            <div className="w-full">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Línea de tiempo de {currentPlayer.name} ({currentPlayer.cards?.length || 0} canciones)
                </span>
                <span className="text-[11px] text-slate-500">
                  Ordenadas cronológicamente de izquierda a derecha
                </span>
              </div>

              <Timeline 
                cards={currentPlayer.cards || []}
                selectedIndex={selectedSlot}
                onSelectSlot={(idx) => !isRevealed && setSelectedSlot(idx)}
                isRevealed={isRevealed}
                correctSlotIndex={correctSlotIndex}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modal de Instrucciones de Juego */}
      <InstructionsModal 
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Modal de Victoria / Fin de Partida */}
      {gameState === 'gameover' && winner && (
        <GameOverModal 
          winner={winner}
          players={players}
          onRematch={() => handleStartGame({ players, targetCards, playlistId: URBAN_ARGENTINA_PLAYLIST.id })}
          onNewGame={() => setGameState('setup')}
        />
      )}

      {/* Diálogo de Confirmación para Reiniciar */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-center space-y-4">
            <div className="p-3 rounded-full bg-rose-500/20 text-rose-400 w-12 h-12 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">¿Reiniciar la partida?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Se perderá el progreso de la partida actual y volverán a la pantalla de configuración.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetGame}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500"
              >
                Sí, reiniciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página sutil */}
      <footer className="w-full py-2 text-center text-[10px] text-slate-600 border-t border-slate-800/40">
        BeatLine • Diseñado para jugar en familia en tablet o pantalla táctil
      </footer>
    </div>
  );
}
