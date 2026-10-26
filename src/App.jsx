import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  RotateCcw,
  Trophy,
  Sparkles,
  Check,
  X,
  ArrowRight,
  Disc,
  AlertTriangle,
  Zap,
  SkipForward,
  Gift,
  Mic,
  Undo2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import PlayerSetup from './components/PlayerSetup';
import InstructionsModal from './components/InstructionsModal';
import AudioPlayer from './components/AudioPlayer';
import Timeline from './components/Timeline';
import GameOverModal from './components/GameOverModal';

import { getPlaylistById } from './services/playlistStorage';
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
  // Si otro jugador usa 1 ficha para robar el turno actual, guardamos quién está respondiendo
  const [stealingPlayerIndex, setStealingPlayerIndex] = useState(null);
  const [playlistTitle, setPlaylistTitle] = useState('Urbano Argentino 🇦🇷');
  const [activePlaylistId, setActivePlaylistId] = useState('urbano-argentina');

  const [deck, setDeck] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctSlotIndex, setCorrectSlotIndex] = useState(null);
  const [targetCards, setTargetCards] = useState(10);
  const [winner, setWinner] = useState(null);

  // Estados de fichas y bonus en el turno actual
  const [bonusClaimedThisTurn, setBonusClaimedThisTurn] = useState(false);
  const [cardRevokedThisTurn, setCardRevokedThisTurn] = useState(false);
  const [showStealModal, setShowStealModal] = useState(false);

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
        stealingPlayerIndex,
        playlistTitle,
        activePlaylistId,
        deck,
        currentTrack,
        selectedSlot,
        isRevealed,
        isCorrect,
        correctSlotIndex,
        targetCards,
        winner,
        bonusClaimedThisTurn,
        cardRevokedThisTurn
      });
    }
  }, [
    gameState,
    players,
    activePlayerIndex,
    stealingPlayerIndex,
    playlistTitle,
    activePlaylistId,
    deck,
    currentTrack,
    selectedSlot,
    isRevealed,
    isCorrect,
    correctSlotIndex,
    targetCards,
    winner,
    bonusClaimedThisTurn,
    cardRevokedThisTurn
  ]);

  // Reanudar partida guardada
  const handleResumeGame = () => {
    const saved = loadGameSession();
    if (saved) {
      setPlayers(saved.players || []);
      setActivePlayerIndex(saved.activePlayerIndex || 0);
      setStealingPlayerIndex(
        saved.stealingPlayerIndex !== undefined ? saved.stealingPlayerIndex : null
      );
      setPlaylistTitle(saved.playlistTitle || 'Urbano Argentino 🇦🇷');
      setActivePlaylistId(saved.activePlaylistId || 'urbano-argentina');
      setDeck(saved.deck || []);
      setCurrentTrack(saved.currentTrack || null);
      setSelectedSlot(saved.selectedSlot !== undefined ? saved.selectedSlot : null);
      setIsRevealed(saved.isRevealed || false);
      setIsCorrect(saved.isCorrect !== undefined ? saved.isCorrect : null);
      setCorrectSlotIndex(saved.correctSlotIndex !== undefined ? saved.correctSlotIndex : null);
      setTargetCards(saved.targetCards || 10);
      setWinner(saved.winner || null);
      setBonusClaimedThisTurn(saved.bonusClaimedThisTurn || false);
      setCardRevokedThisTurn(saved.cardRevokedThisTurn || false);
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
    const chosenPlaylist = getPlaylistById(playlistId);
    setPlaylistTitle(chosenPlaylist.title);
    setActivePlaylistId(chosenPlaylist.id);

    const shuffled = shuffleDeck(chosenPlaylist.tracks);

    // Repartir 1 carta inicial a cada jugador como base de su línea de tiempo
    const preparedPlayers = [];
    let currentDeck = [...shuffled];

    for (let p of initialPlayers) {
      if (currentDeck.length === 0) {
        currentDeck = shuffleDeck(chosenPlaylist.tracks);
      }
      const initialTrack = currentDeck.pop();
      const enriched = await enrichTrack(initialTrack);
      preparedPlayers.push({
        ...p,
        tokens: p.tokens !== undefined ? p.tokens : 2,
        cards: [enriched],
        score: 1
      });
    }

    setPlayers(preparedPlayers);
    setTargetCards(target);
    setActivePlayerIndex(0);
    setStealingPlayerIndex(null);
    setGameState('playing');
    setWinner(null);
    clearGameSession();

    await prepareNextTurn(currentDeck, 0, chosenPlaylist);
  };

  // Preparar el siguiente turno
  const prepareNextTurn = async (remainingDeck, nextPlayerIndex, playlistObj = null) => {
    setSelectedSlot(null);
    setIsRevealed(false);
    setIsCorrect(null);
    setCorrectSlotIndex(null);
    setStealingPlayerIndex(null);
    setBonusClaimedThisTurn(false);
    setCardRevokedThisTurn(false);

    let deckToUse = [...remainingDeck];
    if (deckToUse.length === 0) {
      const currentPl = playlistObj || getPlaylistById(activePlaylistId);
      deckToUse = shuffleDeck(currentPl.tracks);
    }

    const nextTrack = deckToUse.pop();
    setDeck(deckToUse);
    setActivePlayerIndex(nextPlayerIndex);

    setIsEnriching(true);
    const enriched = await enrichTrack(nextTrack);
    setCurrentTrack(enriched);
    setIsEnriching(false);
  };

  // Jugador que actualmente está colocando la carta (el del turno o quien robó con ficha)
  const effectivePlayerIndex =
    stealingPlayerIndex !== null ? stealingPlayerIndex : activePlayerIndex;
  const currentPlayer = players[effectivePlayerIndex] || {};

  // Acción de Ficha 1: Robar el turno cuando el jugador activo no se sabe la canción
  const handleStealTurn = (challengerIdx) => {
    const challenger = players[challengerIdx];
    if (!challenger || (challenger.tokens || 0) < 1) return;

    const updatedPlayers = [...players];
    updatedPlayers[challengerIdx] = {
      ...challenger,
      tokens: challenger.tokens - 1
    };

    setPlayers(updatedPlayers);
    setStealingPlayerIndex(challengerIdx);
    setSelectedSlot(null);
    setShowStealModal(false);
  };

  // Acción de Ficha 2: Saltar canción desconocida por 1 Ficha
  const handleSkipSongWithToken = async () => {
    if ((currentPlayer.tokens || 0) < 1 || isRevealed) return;

    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: currentPlayer.tokens - 1
    };
    setPlayers(updatedPlayers);

    // Sacar nueva canción manteniendo el mismo jugador
    await prepareNextTurn(deck, activePlayerIndex);
  };

  // Acción de Ficha 3: Canjear 3 Fichas por 1 Carta Directa
  const handleRedeemFreeCard = () => {
    if ((currentPlayer.tokens || 0) < 3 || !currentTrack || isRevealed) return;

    const cards = currentPlayer.cards || [];
    let insertIdx = 0;
    while (insertIdx < cards.length && cards[insertIdx].year <= currentTrack.year) {
      insertIdx++;
    }

    const updatedCards = [...cards];
    updatedCards.splice(insertIdx, 0, currentTrack);

    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: currentPlayer.tokens - 3,
      cards: updatedCards,
      score: updatedCards.length
    };

    setPlayers(updatedPlayers);
    setSelectedSlot(insertIdx);
    setCorrectSlotIndex(insertIdx);
    setIsCorrect(true);
    setIsRevealed(true);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {}

    if (updatedCards.length >= targetCards) {
      setWinner(updatedPlayers[effectivePlayerIndex]);
      setTimeout(() => {
        setGameState('gameover');
        clearGameSession();
      }, 1800);
    }
  };

  // Validar colocación de la carta en la línea del tiempo
  const handleReveal = () => {
    if (selectedSlot === null || !currentTrack) return;

    const cards = currentPlayer.cards || [];
    let valid = true;

    if (selectedSlot > 0) {
      const prevCard = cards[selectedSlot - 1];
      if (currentTrack.year < prevCard.year) {
        valid = false;
      }
    }

    if (selectedSlot < cards.length) {
      const nextCard = cards[selectedSlot];
      if (currentTrack.year > nextCard.year) {
        valid = false;
      }
    }

    let realIndex = 0;
    while (realIndex < cards.length && cards[realIndex].year <= currentTrack.year) {
      realIndex++;
    }

    setIsCorrect(valid);
    setCorrectSlotIndex(realIndex);
    setIsRevealed(true);

    if (valid) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      const updatedCards = [...cards];
      updatedCards.splice(selectedSlot, 0, currentTrack);

      const updatedPlayers = [...players];
      updatedPlayers[effectivePlayerIndex] = {
        ...currentPlayer,
        cards: updatedCards,
        score: updatedCards.length
      };
      setPlayers(updatedPlayers);

      if (updatedCards.length >= targetCards) {
        setWinner(updatedPlayers[effectivePlayerIndex]);
        setTimeout(() => {
          setGameState('gameover');
          clearGameSession();
        }, 1800);
      }
    }
  };

  // Premiar con +1 Ficha si adivinó Canción y Artista en voz alta
  const handleAwardGuessBonus = () => {
    if (bonusClaimedThisTurn) return;
    const updatedPlayers = [...players];
    const currentTokens = currentPlayer.tokens || 0;
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: Math.min(5, currentTokens + 1)
    };
    setPlayers(updatedPlayers);
    setBonusClaimedThisTurn(true);
  };

  // Si en la familia juegan con regla estricta ("Si no adivinó la canción, no se lleva la carta")
  const handleRevokeCardForNotKnowingSong = () => {
    if (!isCorrect || cardRevokedThisTurn) return;
    const updatedCards = (currentPlayer.cards || []).filter((c) => c.id !== currentTrack.id);
    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      cards: updatedCards,
      score: updatedCards.length
    };
    setPlayers(updatedPlayers);
    setCardRevokedThisTurn(true);
    setIsCorrect(false);
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

  return (
    <div className="min-h-screen flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Barra Superior / Header */}
      <header
        className="w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-40"
        style={{
          backgroundColor: 'var(--color-bg-glass)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-tr from-violet-600 to-cyan-500 text-white">
            <Disc className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-black text-lg sm:text-xl tracking-tight text-white leading-tight">
              BeatLine
            </h1>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-1 font-mono truncate max-w-[180px] sm:max-w-xs">
              {playlistTitle}
            </span>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all active:scale-95 cursor-pointer"
            title="Ver manual, reglas y uso de fichas"
          >
            <BookOpen className="w-4 h-4 text-violet-400" />
            <span>Reglas y Fichas ⚡</span>
          </button>

          {gameState === 'playing' && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-950/30 border border-slate-700/40 transition-colors cursor-pointer"
              title="Salir o reiniciar partida"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* CONTENIDO SEGÚN ESTADO */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 py-3 max-w-6xl mx-auto">
        {gameState === 'setup' && (
          <PlayerSetup
            onStartGame={handleStartGame}
            hasSavedGame={hasSavedGame}
            onResumeGame={handleResumeGame}
          />
        )}

        {gameState === 'playing' && currentTrack && (
          <div className="w-full flex flex-col items-center space-y-3 animate-fadeIn">
            {/* Marcador Global de Jugadores (Cartas 💿 y Fichas ⚡) */}
            <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 px-1">
              {players.map((p, idx) => {
                const isTurn = idx === effectivePlayerIndex;
                const isStealing = idx === stealingPlayerIndex;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl border text-xs transition-all shrink-0 ${
                      isStealing
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow-lg'
                        : isTurn
                        ? 'bg-violet-950/70 border-violet-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate max-w-[100px]">{p.name}</span>
                      {isStealing && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] uppercase">
                          ¡Robando!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold">
                      <span className="text-cyan-300" title="Cartas en su línea del tiempo">
                        💿 {p.cards?.length || 0}/{targetCards}
                      </span>
                      <span className="text-amber-400" title="Fichas BeatLine disponibles">
                        ⚡ {p.tokens || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Banner de Jugador Activo y Controles de Fichas ⚡ */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md"
                  style={{
                    backgroundColor:
                      stealingPlayerIndex !== null ? 'var(--color-accent)' : 'var(--color-primary)'
                  }}
                >
                  {stealingPlayerIndex !== null ? '⚡' : `#${activePlayerIndex + 1}`}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {stealingPlayerIndex !== null
                      ? `¡Turno robado a ${players[activePlayerIndex]?.name}!`
                      : 'Escucha, adivina la canción en voz alta y acomódala'}
                  </span>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    Juega: {currentPlayer.name}
                    <span className="text-xs font-mono px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      ⚡ {currentPlayer.tokens || 0} fichas
                    </span>
                  </h2>
                </div>
              </div>

              {/* Botones de Uso de Fichas antes de revelar */}
              {!isRevealed && (
                <div className="flex flex-wrap items-center gap-2">
                  {/* Botón: Otro jugador roba la canción si el actual no se la sabe */}
                  {players.some((p, i) => i !== effectivePlayerIndex && (p.tokens || 0) >= 1) && (
                    <button
                      type="button"
                      onClick={() => setShowStealModal(true)}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      title="Si el jugador en turno no se sabe la canción, otro puede pagar 1 ficha y robarla"
                    >
                      <Zap className="w-3.5 h-3.5 fill-amber-400" />
                      ¿No se la sabe? Robar (1 ⚡)
                    </button>
                  )}

                  {/* Botón: Saltar canción con 1 ficha */}
                  {(currentPlayer.tokens || 0) >= 1 && (
                    <button
                      type="button"
                      onClick={handleSkipSongWithToken}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      title="Paga 1 ficha para descartar esta canción y escuchar otra"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
                      Saltar (1 ⚡)
                    </button>
                  )}

                  {/* Botón: Comprar carta gratis con 3 fichas */}
                  {(currentPlayer.tokens || 0) >= 3 && (
                    <button
                      type="button"
                      onClick={handleRedeemFreeCard}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      title="Canjea 3 fichas para ganar esta carta automáticamente"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Canjear Carta (3 ⚡)
                    </button>
                  )}
                </div>
              )}
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

            {/* Acciones de Revelar / Resultado y Bonus Verbal */}
            <div className="flex flex-col items-center justify-center gap-2.5 my-1 w-full">
              {!isRevealed ? (
                <button
                  onClick={handleReveal}
                  disabled={selectedSlot === null || isEnriching}
                  className="px-8 py-3.5 rounded-2xl font-black text-base text-white shadow-xl transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor:
                      selectedSlot !== null
                        ? 'var(--color-primary)'
                        : 'var(--color-bg-surface-elevated)',
                    boxShadow: selectedSlot !== null ? 'var(--shadow-glow-primary)' : 'none'
                  }}
                >
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  {selectedSlot === null
                    ? '1º Di qué canción es y toca una ranura [ + ] abajo'
                    : '¡Revelar Año y Canción!'}
                </button>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full max-w-2xl">
                  {/* Resultado principal */}
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <div
                      className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-bold ${
                        isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                          : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-5 h-5 shrink-0" />
                          <span>¡Año correcto ({currentTrack.year})! Carta sumada a {currentPlayer.name}</span>
                        </>
                      ) : (
                        <>
                          <X className="w-5 h-5 shrink-0" />
                          <span>
                            {cardRevokedThisTurn
                              ? 'Carta anulada por no saberse la canción'
                              : `¡Fallaste el año! Era de ${currentTrack.year}`}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleNextTurn}
                      className="px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm text-slate-950 transition-transform active:scale-95 shadow-xl flex items-center gap-2 cursor-pointer"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      Siguiente Turno <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Validación Verbal Familiar: Ganar +1 Ficha o Anular si no se supo la canción */}
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <button
                      type="button"
                      disabled={bonusClaimedThisTurn}
                      onClick={handleAwardGuessBonus}
                      className={`px-3.5 py-2 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                        bonusClaimedThisTurn
                          ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                          : 'bg-slate-800 hover:bg-slate-700 border-amber-500/40 text-amber-300'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {bonusClaimedThisTurn
                        ? '¡+1 Ficha ⚡ entregada por saberse la canción!'
                        : '¿Dijo bien Canción y Artista en voz alta? (+1 ⚡)'}
                    </button>

                    {isCorrect && !cardRevokedThisTurn && (
                      <button
                        type="button"
                        onClick={handleRevokeCardForNotKnowingSong}
                        className="px-3 py-2 rounded-xl font-semibold bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 flex items-center gap-1 cursor-pointer"
                        title="Si juegan con la regla de que es obligatorio saberse la canción para ganar la carta, toca aquí si no se la supo"
                      >
                        <Undo2 className="w-3.5 h-3.5" />
                        No se supo la canción (Quitar carta)
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Zona Inferior: Línea de Tiempo del Jugador que está respondiendo */}
            <div className="w-full">
              <div className="flex items-center justify-between px-2 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Línea de tiempo de {currentPlayer.name} ({currentPlayer.cards?.length || 0} canciones)
                </span>
                <span className="text-[11px] text-slate-500">
                  Toca una ranura [ + ] para ubicar el año
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

      {/* Modal para elegir quién ROBA la canción usando 1 Ficha ⚡ */}
      {showStealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                ¡Robar Turno y Canción!
              </h3>
              <button
                onClick={() => setShowStealModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si <strong>{currentPlayer.name}</strong> no se sabe esta canción, elige qué familiar gastará <strong>1 Ficha ⚡</strong> para robarla y acomodarla en su propia línea del tiempo:
            </p>

            <div className="space-y-2">
              {players.map((p, idx) => {
                if (idx === effectivePlayerIndex) return null;
                const hasTokens = (p.tokens || 0) >= 1;
                return (
                  <button
                    key={p.id}
                    disabled={!hasTokens}
                    onClick={() => handleStealTurn(idx)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-800 hover:bg-violet-950/60 border border-slate-700 hover:border-amber-400 text-left transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-sm text-white block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">
                        Tiene {p.cards?.length || 0} cartas en su línea del tiempo
                      </span>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                      Usar 1 ⚡ (Tiene {p.tokens || 0})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
          onRematch={() =>
            handleStartGame({
              players,
              targetCards,
              playlistId: activePlaylistId
            })
          }
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
              <h3 className="font-bold text-white text-base">¿Reiniciar o cambiar Playlist?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Volverás a la pantalla de configuración para elegir otra playlist o cambiar jugadores.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetGame}
                className="py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
              >
                Sí, salir al menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página sutil */}
      <footer className="w-full py-2 text-center text-[10px] text-slate-600 border-t border-slate-800/40">
        BeatLine • Pasa y Juega • Listo para Tablet y Vercel
      </footer>
    </div>
  );
}
