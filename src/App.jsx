import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  RotateCcw,
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
  Undo2,
  Flag,
  Infinity as InfinityIcon,
  Eye,
  Sun,
  Moon,
  Clock,
  Lightbulb,
  Dices,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

import PlayerSetup from './components/PlayerSetup';
import InstructionsModal from './components/InstructionsModal';
import AudioPlayer from './components/AudioPlayer';
import Timeline from './components/Timeline';
import GameOverModal from './components/GameOverModal';
import SurpriseEventModal from './components/SurpriseEventModal';

import { getPlaylistById } from './services/playlistStorage';
import { enrichTrack } from './services/musicService';
import {
  saveGameSession,
  loadGameSession,
  clearGameSession,
  hasActiveSession
} from './services/gameStorage';
import {
  playSlotSelectSound,
  playSuccessSound,
  playErrorSound,
  playTokenSound,
  playTickSound,
  playEventSound
} from './utils/soundEffects';
import { getRandomSurpriseEvent } from './data/surpriseEvents';

export default function App() {
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'playing' | 'gameover'
  const [players, setPlayers] = useState([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [stealingPlayerIndex, setStealingPlayerIndex] = useState(null);
  const [viewingPlayerIndex, setViewingPlayerIndex] = useState(null);
  const [playlistTitle, setPlaylistTitle] = useState('Mix Completo 🎵');
  const [activePlaylistId, setActivePlaylistId] = useState('mix-completo');

  // Parámetros de juego
  const [difficulty, setDifficulty] = useState('classic'); // 'classic' | 'relaxed' | 'expert'
  const [turnTimerSeconds, setTurnTimerSeconds] = useState(0); // 0 (sin límite)
  const [enableEvents, setEnableEvents] = useState(true);
  const [eventProbability, setEventProbability] = useState(20); // 20% por defecto
  const [targetCards, setTargetCards] = useState(10);
  const [turnCount, setTurnCount] = useState(1);

  // Evento sorpresa del turno actual
  const [activeEvent, setActiveEvent] = useState(null);
  const [hasUsedSecondChance, setHasUsedSecondChance] = useState(false);
  const [secondChanceActive, setSecondChanceActive] = useState(false);
  const [exactYearBonusClaimed, setExactYearBonusClaimed] = useState(false);

  // Pistas comodín activadas en el turno actual
  const [hint1Active, setHint1Active] = useState(false); // Portada desenfocada + Artista
  const [eliminatedSlots, setEliminatedSlots] = useState([]); // Ranuras descartadas por Pista 2

  // Temporizador de Adrenalina
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const [deck, setDeck] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isEnriching, setIsEnriching] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [correctSlotIndex, setCorrectSlotIndex] = useState(null);
  const [winner, setWinner] = useState(null);

  // Modo Infinito / Libre
  const [isEndlessMode, setIsEndlessMode] = useState(false);
  const [isFinalEnd, setIsFinalEnd] = useState(false);

  // Estados de fichas y bonus en el turno actual
  const [bonusClaimedThisTurn, setBonusClaimedThisTurn] = useState(false);
  const [cardRevokedThisTurn, setCardRevokedThisTurn] = useState(false);
  const [showStealModal, setShowStealModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const [wasPassed, setWasPassed] = useState(false);

  const [showInstructions, setShowInstructions] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Tema visual: 'dark' (por defecto) o 'light' (alto contraste para exteriores)
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('beatline_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('beatline_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
        difficulty,
        turnTimerSeconds,
        enableEvents,
        eventProbability,
        turnCount,
        activeEvent,
        hint1Active,
        eliminatedSlots,
        deck,
        currentTrack,
        selectedSlot,
        isRevealed,
        isCorrect,
        correctSlotIndex,
        targetCards,
        winner,
        isEndlessMode,
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
    difficulty,
    turnTimerSeconds,
    enableEvents,
    turnCount,
    activeEvent,
    hint1Active,
    eliminatedSlots,
    deck,
    currentTrack,
    selectedSlot,
    isRevealed,
    isCorrect,
    correctSlotIndex,
    targetCards,
    winner,
    isEndlessMode,
    bonusClaimedThisTurn,
    cardRevokedThisTurn
  ]);

  // Manejador del reloj de cuenta regresiva (Adrenalina - solo corre cuando dan Play)
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (gameState === 'playing' && turnTimerSeconds > 0 && !isRevealed) {
      if (!hasStartedPlayback) {
        setTimeLeft(turnTimerSeconds);
        return;
      }

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Tiempo agotado: marcar error automático si no reveló
            handleTimeExpired();
            return 0;
          }
          if (prev <= 10) {
            playTickSound(true);
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, turnTimerSeconds, currentTrack, isRevealed, hasStartedPlayback]);

  const handleTimeExpired = () => {
    if (isRevealed) return;
    playErrorSound();
    setIsCorrect(false);
    setIsRevealed(true);
  };

  // Reanudar partida guardada
  const handleResumeGame = () => {
    const saved = loadGameSession();
    if (saved) {
      setPlayers(saved.players || []);
      setActivePlayerIndex(saved.activePlayerIndex || 0);
      setStealingPlayerIndex(
        saved.stealingPlayerIndex !== undefined ? saved.stealingPlayerIndex : null
      );
      setViewingPlayerIndex(null);
      setPlaylistTitle(saved.playlistTitle || 'Urbano Argentino 🇦🇷');
      setActivePlaylistId(saved.activePlaylistId || 'urbano-argentina');
      setDifficulty(saved.difficulty || 'classic');
      setTurnTimerSeconds(saved.turnTimerSeconds || 0);
      setEnableEvents(saved.enableEvents !== undefined ? saved.enableEvents : true);
      setEventProbability(saved.eventProbability !== undefined ? saved.eventProbability : 20);
      setTurnCount(saved.turnCount || 1);
      setActiveEvent(saved.activeEvent || null);
      setHint1Active(saved.hint1Active || false);
      setEliminatedSlots(saved.eliminatedSlots || []);
      setDeck(saved.deck || []);
      setCurrentTrack(saved.currentTrack || null);
      setSelectedSlot(saved.selectedSlot !== undefined ? saved.selectedSlot : null);
      setIsRevealed(saved.isRevealed || false);
      setIsCorrect(saved.isCorrect !== undefined ? saved.isCorrect : null);
      setCorrectSlotIndex(saved.correctSlotIndex !== undefined ? saved.correctSlotIndex : null);
      setTargetCards(saved.targetCards || 10);
      setWinner(saved.winner || null);
      setIsEndlessMode(saved.isEndlessMode || false);
      setBonusClaimedThisTurn(saved.bonusClaimedThisTurn || false);
      setCardRevokedThisTurn(saved.cardRevokedThisTurn || false);
      setGameState('playing');
      setHasSavedGame(false);
    }
  };

  // Descartar partida guardada previa
  const handleDiscardSavedGame = () => {
    clearGameSession();
    setHasSavedGame(false);
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
  const handleStartGame = async ({
    players: initialPlayers,
    targetCards: target,
    difficulty: diff,
    turnTimerSeconds: timerSec,
    enableEvents: eventsOn,
    eventProbability: prob = 20,
    playlistId
  }) => {
    const chosenPlaylist = getPlaylistById(playlistId);
    setPlaylistTitle(chosenPlaylist.title);
    setActivePlaylistId(chosenPlaylist.id);
    setDifficulty(diff);
    setTurnTimerSeconds(timerSec);
    setEnableEvents(eventsOn);
    setEventProbability(prob);
    setTurnCount(1);

    const shuffled = shuffleDeck(chosenPlaylist.tracks);

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
        tokens: p.tokens !== undefined ? p.tokens : diff === 'expert' ? 1 : 2,
        cards: [enriched],
        score: 1,
        stats: { attempts: 0, hits: 0, steals: 0, hintsUsed: 0 }
      });
    }

    setPlayers(preparedPlayers);
    setTargetCards(target);
    setActivePlayerIndex(0);
    setStealingPlayerIndex(null);
    setViewingPlayerIndex(null);
    setIsEndlessMode(false);
    setIsFinalEnd(false);
    setGameState('playing');
    setWinner(null);
    clearGameSession();

    await prepareNextTurn(currentDeck, 0, chosenPlaylist, 1, eventsOn, prob);
  };

  // Preparar el siguiente turno
  const prepareNextTurn = async (
    remainingDeck,
    nextPlayerIndex,
    playlistObj = null,
    nextTurnCount = null,
    eventsEnabled = null,
    probParam = null
  ) => {
    setSelectedSlot(null);
    setIsRevealed(false);
    setIsCorrect(null);
    setCorrectSlotIndex(null);
    setStealingPlayerIndex(null);
    setViewingPlayerIndex(null);
    setBonusClaimedThisTurn(false);
    setCardRevokedThisTurn(false);
    setHint1Active(false);
    setEliminatedSlots([]);
    setHasStartedPlayback(false);
    setWasPassed(false);
    setHasUsedSecondChance(false);
    setSecondChanceActive(false);
    setExactYearBonusClaimed(false);

    const tCount = nextTurnCount !== null ? nextTurnCount : turnCount + 1;
    setTurnCount(tCount);

    const useEvents = eventsEnabled !== null ? eventsEnabled : enableEvents;
    const prob = probParam !== null ? probParam : eventProbability;

    // Probabilidad configurable turno a turno (por defecto 20%)
    const shouldTriggerEvent = useEvents && prob > 0 && Math.random() * 100 < prob;

    let selectedEv = null;
    if (shouldTriggerEvent) {
      selectedEv = getRandomSurpriseEvent();
      setActiveEvent(selectedEv);
      setShowEventModal(true);
      playEventSound();
      if (selectedEv.freeHint) {
        setHint1Active(true);
      }
      if (selectedEv.allGetTokens) {
        setPlayers((prev) =>
          prev.map((p) => ({
            ...p,
            tokens: Math.min(5, (p.tokens || 0) + selectedEv.allGetTokens)
          }))
        );
      }
    } else {
      setActiveEvent(null);
      setShowEventModal(false);
    }

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

    // Si el evento otorga Pista 2 Gratis (descarte de 50% de ranuras erróneas)
    if (selectedEv?.freeSlotElimination) {
      const activeP = players[nextPlayerIndex];
      const pCards = activeP?.cards || [];
      const totalSlots = pCards.length + 1;
      if (totalSlots >= 3) {
        let correctIdx = 0;
        while (correctIdx < pCards.length && pCards[correctIdx].year <= enriched.year) {
          correctIdx++;
        }
        const wrongSlots = [];
        for (let i = 0; i < totalSlots; i++) {
          if (i !== correctIdx) wrongSlots.push(i);
        }
        const count = Math.floor(wrongSlots.length / 2);
        setEliminatedSlots(shuffleDeck(wrongSlots).slice(0, count));
      }
    }
  };

  const effectivePlayerIndex =
    stealingPlayerIndex !== null ? stealingPlayerIndex : activePlayerIndex;
  const currentPlayer = players[effectivePlayerIndex] || {};

  const displayedPlayerIndex =
    viewingPlayerIndex !== null ? viewingPlayerIndex : effectivePlayerIndex;
  const displayedPlayer = players[displayedPlayerIndex] || currentPlayer;
  const isPeekingOtherPlayer =
    viewingPlayerIndex !== null && viewingPlayerIndex !== effectivePlayerIndex;

  // Cambiar evento sorpresa gastando 1 ⚡ Ficha
  const handleChangeEvent = () => {
    if ((currentPlayer.tokens || 0) < 1 || !activeEvent) return;
    playTokenSound();
    const newEvent = getRandomSurpriseEvent(activeEvent.id);
    setActiveEvent(newEvent);

    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: currentPlayer.tokens - 1
    };
    setPlayers(updatedPlayers);
    if (newEvent.freeHint) setHint1Active(true);
  };

  // Pista 1 (Visual/Artista - Cuesta 0.5 ⚡)
  const handleUseHint1 = () => {
    if (hint1Active || isRevealed) return;
    if ((currentPlayer.tokens || 0) < 0.5) return;

    playTokenSound();
    setHint1Active(true);
    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: Math.max(0, (currentPlayer.tokens || 0) - 0.5),
      stats: {
        ...(currentPlayer.stats || {}),
        hintsUsed: ((currentPlayer.stats?.hintsUsed || 0) + 1)
      }
    };
    setPlayers(updatedPlayers);
  };

  // Pista 2 (Descartar 50% de ranuras incorrectas - Cuesta 0.5 ⚡)
  const handleUseHint2 = () => {
    if (eliminatedSlots.length > 0 || isRevealed || !currentTrack) return;
    if ((currentPlayer.tokens || 0) < 0.5) return;

    const cards = currentPlayer.cards || [];
    const totalSlots = cards.length + 1;
    if (totalSlots < 3) return; // Se necesitan al menos 3 ranuras para descartar

    playTokenSound();
    // Encontrar cuál es la ranura correcta
    let correctIdx = 0;
    while (correctIdx < cards.length && cards[correctIdx].year <= currentTrack.year) {
      correctIdx++;
    }

    // Identificar ranuras incorrectas
    const wrongSlots = [];
    for (let i = 0; i < totalSlots; i++) {
      if (i !== correctIdx) wrongSlots.push(i);
    }

    // Descartar la mitad aleatoriamente
    const slotsToEliminateCount = Math.floor(wrongSlots.length / 2);
    const shuffledWrong = shuffleDeck(wrongSlots);
    const eliminated = shuffledWrong.slice(0, slotsToEliminateCount);

    setEliminatedSlots(eliminated);
    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: Math.max(0, (currentPlayer.tokens || 0) - 0.5),
      stats: {
        ...(currentPlayer.stats || {}),
        hintsUsed: ((currentPlayer.stats?.hintsUsed || 0) + 1)
      }
    };
    setPlayers(updatedPlayers);
  };

  // Acción de Ficha: Robar turno
  const handleStealTurn = (challengerIdx) => {
    const challenger = players[challengerIdx];
    const cost = activeEvent?.stealDiscount || 1;
    if (!challenger || (challenger.tokens || 0) < cost) return;

    playTokenSound();
    const updatedPlayers = [...players];
    updatedPlayers[challengerIdx] = {
      ...challenger,
      tokens: Math.max(0, (challenger.tokens || 0) - cost),
      stats: {
        ...(challenger.stats || {}),
        steals: ((challenger.stats?.steals || 0) + 1)
      }
    };

    setPlayers(updatedPlayers);
    setStealingPlayerIndex(challengerIdx);
    setViewingPlayerIndex(null);
    setSelectedSlot(null);
    setEliminatedSlots([]);
    setShowStealModal(false);
  };

  // Pasar turno cuando nadie se la sabe ni nadie la quiere robar
  const handlePassTurnWithoutGuessing = () => {
    playErrorSound();
    setIsRevealed(true);
    setIsCorrect(false);
    setSelectedSlot(null);
    setWasPassed(true);
  };

  // Acción de Ficha: Saltar canción por 1 ⚡
  const handleSkipSongWithToken = async () => {
    if ((currentPlayer.tokens || 0) < 1 || isRevealed) return;

    playTokenSound();
    const updatedPlayers = [...players];
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: (currentPlayer.tokens || 0) - 1
    };
    setPlayers(updatedPlayers);

    await prepareNextTurn(deck, activePlayerIndex);
  };

  // Acción de Ficha: Canjear 3 ⚡ por Carta
  const handleRedeemFreeCard = () => {
    if ((currentPlayer.tokens || 0) < 3 || !currentTrack || isRevealed) return;

    playSuccessSound();
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
      tokens: (currentPlayer.tokens || 0) - 3,
      cards: updatedCards,
      score: updatedCards.length,
      stats: {
        ...(currentPlayer.stats || {}),
        attempts: (currentPlayer.stats?.attempts || 0) + 1,
        hits: (currentPlayer.stats?.hits || 0) + 1
      }
    };

    setPlayers(updatedPlayers);
    setViewingPlayerIndex(null);
    setSelectedSlot(insertIdx);
    setCorrectSlotIndex(insertIdx);
    setIsCorrect(true);
    setIsRevealed(true);

    try {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
    } catch {}

    if (!isEndlessMode && updatedCards.length >= targetCards) {
      setWinner(updatedPlayers[effectivePlayerIndex]);
      setIsFinalEnd(false);
      setTimeout(() => {
        setGameState('gameover');
      }, 1600);
    }
  };

  // Validar colocación de la carta en la línea del tiempo
  const handleReveal = () => {
    if (selectedSlot === null || !currentTrack) return;

    setViewingPlayerIndex(null);
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

    // Tolerancia por modo de dificultad o evento especial
    // Relajada: ±2 años; Turno blindado: ±3 años
    let tolerance = 0;
    if (difficulty === 'relaxed') tolerance = Math.max(tolerance, 2);
    if (activeEvent?.marginTolerance) tolerance = Math.max(tolerance, activeEvent.marginTolerance);

    if (!valid && tolerance > 0) {
      const prevYear = selectedSlot > 0 ? cards[selectedSlot - 1].year : -9999;
      const nextYear = selectedSlot < cards.length ? cards[selectedSlot].year : 9999;
      const distPrev = Math.abs(currentTrack.year - prevYear);
      const distNext = Math.abs(currentTrack.year - nextYear);
      if (distPrev <= tolerance || distNext <= tolerance) {
        valid = true;
      }
    }

    let realIndex = 0;
    while (realIndex < cards.length && cards[realIndex].year <= currentTrack.year) {
      realIndex++;
    }

    // Si falló pero tiene el evento de Segunda Oportunidad intacto
    if (!valid && activeEvent?.secondChance && !hasUsedSecondChance) {
      playErrorSound();
      setHasUsedSecondChance(true);
      setSecondChanceActive(true);
      setSelectedSlot(null);
      return;
    }

    setIsCorrect(valid);
    setCorrectSlotIndex(realIndex);
    setIsRevealed(true);
    setSecondChanceActive(false);

    const updatedPlayers = [...players];
    const prevStats = currentPlayer.stats || { attempts: 0, hits: 0, steals: 0, hintsUsed: 0 };

    if (valid) {
      playSuccessSound();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch {}

      const updatedCards = [...cards];
      updatedCards.splice(selectedSlot, 0, currentTrack);

      // Si el evento es "Doble o Nada", gana 1 carta adicional del mazo
      if (activeEvent?.rewardCards === 2 && deck.length > 0) {
        const extraTrack = deck.pop();
        if (extraTrack) {
          let extraIdx = 0;
          while (extraIdx < updatedCards.length && updatedCards[extraIdx].year <= extraTrack.year) {
            extraIdx++;
          }
          updatedCards.splice(extraIdx, 0, extraTrack);
        }
      }

      // Bonus de fichas por evento (Fiebre de fichas o Dúo musical)
      let tokenReward = currentPlayer.tokens || 0;
      if (activeEvent?.bonusToken) {
        tokenReward = Math.min(5, tokenReward + activeEvent.bonusToken);
      }
      if (activeEvent?.duoBonus) {
        tokenReward = Math.min(5, tokenReward + activeEvent.duoBonus);
      }

      updatedPlayers[effectivePlayerIndex] = {
        ...currentPlayer,
        cards: updatedCards,
        score: updatedCards.length,
        tokens: tokenReward,
        stats: {
          ...prevStats,
          attempts: prevStats.attempts + 1,
          hits: prevStats.hits + 1
        }
      };
      setPlayers(updatedPlayers);

      if (!isEndlessMode && updatedCards.length >= targetCards) {
        setWinner(updatedPlayers[effectivePlayerIndex]);
        setIsFinalEnd(false);
        setTimeout(() => {
          setGameState('gameover');
        }, 1600);
      }
    } else {
      playErrorSound();
      // Penalización si es Doble o Nada
      let updatedTokens = currentPlayer.tokens || 0;
      if (activeEvent?.penaltyTokens) {
        updatedTokens = Math.max(0, updatedTokens - activeEvent.penaltyTokens);
      }

      updatedPlayers[effectivePlayerIndex] = {
        ...currentPlayer,
        tokens: updatedTokens,
        stats: {
          ...prevStats,
          attempts: prevStats.attempts + 1
        }
      };
      setPlayers(updatedPlayers);
    }
  };

  // Continuar en Modo Infinito
  const handleContinueEndless = () => {
    setIsEndlessMode(true);
    setIsFinalEnd(false);
    setGameState('playing');
    if (isRevealed) {
      const nextIndex = (activePlayerIndex + 1) % players.length;
      prepareNextTurn(deck, nextIndex);
    }
  };

  // Finalizar partida manualmente
  const handleFinishMatchNow = () => {
    const sorted = [...players].sort((a, b) => (b.cards?.length || 0) - (a.cards?.length || 0));
    setWinner(sorted[0] || currentPlayer);
    setIsFinalEnd(true);
    setGameState('gameover');
  };

  // Premiar con +1 Ficha si adivinó Canción y Artista en voz alta
  const handleAwardGuessBonus = () => {
    if (bonusClaimedThisTurn) return;
    playTokenSound();
    const updatedPlayers = [...players];
    const currentTokens = currentPlayer.tokens || 0;
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: Math.min(5, currentTokens + 1)
    };
    setPlayers(updatedPlayers);
    setBonusClaimedThisTurn(true);
  };

  // Premiar con +2 Fichas por acertar el Año Exacto en el evento correspondiente
  const handleAwardExactYearBonus = () => {
    if (exactYearBonusClaimed || !activeEvent?.exactYearBonus) return;
    playTokenSound();
    const updatedPlayers = [...players];
    const currentTokens = currentPlayer.tokens || 0;
    updatedPlayers[effectivePlayerIndex] = {
      ...currentPlayer,
      tokens: Math.min(5, currentTokens + activeEvent.exactYearBonus)
    };
    setPlayers(updatedPlayers);
    setExactYearBonusClaimed(true);
  };

  // Anular carta si juegan con regla estricta y no supo la canción
  const handleRevokeCardForNotKnowingSong = () => {
    if (!isCorrect || cardRevokedThisTurn) return;
    playErrorSound();
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

  // Inicial de pista y década para Pista 1
  const getArtistHintText = () => {
    if (!currentTrack || !currentTrack.artist) return null;
    const initial = currentTrack.artist.charAt(0).toUpperCase();
    const decade = currentTrack.year ? `${Math.floor(currentTrack.year / 10) * 10}s` : '¿?';
    return `Artista empieza con "${initial}" • Lanzada en los ${decade}`;
  };

  const isUrgentTimer = turnTimerSeconds > 0 && timeLeft <= 10 && !isRevealed;

  return (
    <div className="min-h-screen flex flex-col justify-between select-none relative overflow-x-hidden">
      {/* Barra Superior / Header */}
      <header
        className="w-full px-3 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between border-b backdrop-blur-md sticky top-0 z-40"
        style={{
          backgroundColor: 'var(--color-bg-glass)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shadow-md bg-gradient-to-tr from-violet-600 to-cyan-500 text-white shrink-0">
            <Disc className="w-4 h-4 sm:w-5 sm:h-5 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="font-black text-base sm:text-xl tracking-tight text-white leading-tight">
                BeatLine
              </h1>
              {gameState === 'playing' && isEndlessMode && (
                <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                  <InfinityIcon className="w-3 h-3" /> Modo Libre
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 block -mt-0.5 font-mono truncate max-w-[140px] sm:max-w-xs">
              {gameState === 'playing' ? playlistTitle : 'La Línea del Tiempo Musical'}
            </span>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón de Tema Claro (Exteriores) / Oscuro */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all active:scale-95 cursor-pointer"
            title={
              theme === 'dark'
                ? 'Cambiar a Modo Claro (Ideal para exteriores)'
                : 'Cambiar a Modo Oscuro'
            }
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Exterior</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-violet-600" />
                <span className="hidden md:inline">Oscuro</span>
              </>
            )}
          </button>

          {gameState === 'playing' && (
            <button
              onClick={handleFinishMatchNow}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 transition-all active:scale-95 cursor-pointer"
              title="Terminar la partida y ver resultados"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Finalizar</span>
            </button>
          )}

          <button
            onClick={() => setShowInstructions(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/50 transition-all active:scale-95 cursor-pointer"
            title="Ver manual y reglas"
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">Reglas</span>
          </button>

          {gameState === 'playing' && (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-950/30 border border-slate-700/40 transition-colors cursor-pointer"
              title="Salir al menú principal"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </header>

      {/* CONTENIDO SEGÚN ESTADO */}
      <main className="flex-1 flex flex-col justify-center items-center w-full px-2 sm:px-4 py-2 sm:py-3 max-w-6xl mx-auto">
        {gameState === 'setup' && (
          <PlayerSetup
            onStartGame={handleStartGame}
            hasSavedGame={hasSavedGame}
            onResumeGame={handleResumeGame}
            onDiscardGame={handleDiscardSavedGame}
          />
        )}

        {gameState === 'playing' && currentTrack && (
          <div className="w-full flex flex-col items-center space-y-2.5 animate-fadeIn">
            
            {/* Banner de Evento Sorpresa (si está activo este turno) */}
            {activeEvent && !isRevealed && (
              <div 
                onClick={() => setShowEventModal(true)}
                className="w-full p-2.5 sm:p-3 rounded-2xl border flex items-center justify-between gap-3 shadow-lg cursor-pointer hover:brightness-110 transition-all"
                style={{
                  backgroundColor: `${activeEvent.color}15`,
                  borderColor: `${activeEvent.color}60`
                }}
                title="Toca para ver el detalle completo del evento"
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="p-2 rounded-xl text-white font-bold shrink-0"
                    style={{ backgroundColor: activeEvent.color }}
                  >
                    <Dices className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                      <span>{activeEvent.title}</span>
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      {activeEvent.description}
                    </p>
                  </div>
                </div>

                {(currentPlayer.tokens || 0) >= 1 && (
                  <button
                    type="button"
                    onClick={handleChangeEvent}
                    className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 shrink-0 flex items-center gap-1 cursor-pointer"
                    title="Paga 1 ficha si este evento te parece muy complicado"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Cambiar (1 ⚡)
                  </button>
                )}
              </div>
            )}

            {/* Marcador Global de Jugadores */}
            <div className="w-full flex items-center gap-2 overflow-x-auto pb-1 px-1">
              {players.map((p, idx) => {
                const isTurn = idx === effectivePlayerIndex;
                const isStealing = idx === stealingPlayerIndex;
                const isViewing = idx === displayedPlayerIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() =>
                      setViewingPlayerIndex(idx === effectivePlayerIndex ? null : idx)
                    }
                    className={`flex items-center justify-between gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border text-xs transition-all shrink-0 cursor-pointer ${
                      isStealing
                        ? 'bg-amber-950/60 border-amber-400 text-white shadow-lg'
                        : isTurn
                        ? 'bg-violet-950/70 border-violet-500 text-white shadow-md'
                        : isViewing
                        ? 'bg-cyan-950/60 border-cyan-400 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                    title="Toca para ver el tablero de este jugador"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold truncate max-w-[90px]">{p.name}</span>
                      {isStealing && (
                        <span className="px-1 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[8px] uppercase">
                          Robo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono font-bold text-[11px]">
                      <span className="text-cyan-300">
                        💿 {p.cards?.length || 0}
                        {!isEndlessMode ? `/${targetCards}` : ''}
                      </span>
                      <span className="text-amber-400">
                        ⚡ {p.tokens || 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Banner de Jugador Activo, Reloj y Fichas ⚡ */}
            <div className="w-full flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="keep-white w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-md"
                  style={{
                    backgroundColor:
                      stealingPlayerIndex !== null ? 'var(--color-accent)' : 'var(--color-primary)'
                  }}
                >
                  {stealingPlayerIndex !== null ? '⚡' : `#${activePlayerIndex + 1}`}
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    {stealingPlayerIndex !== null
                      ? `¡Turno robado por ${currentPlayer.name}!`
                      : `Turno ${turnCount} • ${difficulty === 'relaxed' ? 'Modo Relajado (±2a)' : 'Modo Clásico'}`}
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    Juega: {currentPlayer.name}
                    <span className="text-xs font-mono px-2 py-0.2 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      ⚡ {currentPlayer.tokens || 0}
                    </span>
                  </h2>
                </div>
              </div>

              {/* Reloj de Adrenalina si está configurado */}
              {turnTimerSeconds > 0 && !isRevealed && (
                <div 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-black text-xs sm:text-sm ${
                    isUrgentTimer 
                      ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse' 
                      : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                >
                  <Clock className={`w-4 h-4 ${isUrgentTimer ? 'text-rose-400 animate-spin-slow' : 'text-amber-400'}`} />
                  <span>{timeLeft}s</span>
                </div>
              )}

              {/* Botones de Fichas y Pistas Comodín */}
              {!isRevealed && (
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Pista 1 (Visual/Artista - 0.5 ⚡) */}
                  {!hint1Active && (currentPlayer.tokens || 0) >= 0.5 && (
                    <button
                      type="button"
                      onClick={handleUseHint1}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 flex items-center gap-1 cursor-pointer"
                      title="Muestra la portada borrosa y la inicial del artista por media ficha"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Pista Artista (0.5 ⚡)
                    </button>
                  )}

                  {/* Pista 2 (Descartar 50% de ranuras - 0.5 ⚡) */}
                  {eliminatedSlots.length === 0 && (currentPlayer.cards?.length || 0) >= 2 && (currentPlayer.tokens || 0) >= 0.5 && (
                    <button
                      type="button"
                      onClick={handleUseHint2}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 cursor-pointer"
                      title="Descarta la mitad de las opciones incorrectas por media ficha"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Descartar Ranuras (0.5 ⚡)
                    </button>
                  )}

                  {/* Robar turno */}
                  {players.some((p, i) => i !== effectivePlayerIndex && (p.tokens || 0) >= (activeEvent?.stealDiscount || 1)) && (
                    <button
                      type="button"
                      onClick={() => setShowStealModal(true)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 flex items-center gap-1 cursor-pointer"
                      title="Otro jugador puede gastar fichas para robarse esta carta"
                    >
                      <Zap className="w-3.5 h-3.5 fill-rose-400" />
                      Robar ({activeEvent?.stealDiscount || 1} ⚡)
                    </button>
                  )}

                  {/* Saltar canción */}
                  {(currentPlayer.tokens || 0) >= 1 && (
                    <button
                      type="button"
                      onClick={handleSkipSongWithToken}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 cursor-pointer"
                      title="Descarta esta canción y escucha otra"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-cyan-400" />
                      Saltar (1 ⚡)
                    </button>
                  )}

                  {/* Canjear 3 fichas por carta */}
                  {(currentPlayer.tokens || 0) >= 3 && (
                    <button
                      type="button"
                      onClick={handleRedeemFreeCard}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 cursor-pointer"
                      title="Gasta 3 fichas y gana esta carta automáticamente"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Comprar (3 ⚡)
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
              maxDuration={activeEvent?.maxDuration || null}
              blurredArtwork={hint1Active}
              artistHint={hint1Active ? getArtistHintText() : null}
              isUrgentTimer={isUrgentTimer}
              onPlaybackStart={() => setHasStartedPlayback(true)}
            />

            {/* Acciones de Revelar / Resultado y Bonus Verbal */}
            <div className="flex flex-col items-center justify-center gap-2.5 my-1 w-full">
              {!isRevealed ? (
                <div className="flex flex-col items-center gap-2 w-full max-w-md">
                  {secondChanceActive && (
                    <div className="w-full p-2.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/70 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-lg">
                      <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>¡Segunda Oportunidad! Esa ranura era incorrecta. Toca otra ranura [ + ] para tu 2º intento gratis.</span>
                    </div>
                  )}

                  <button
                    onClick={handleReveal}
                    disabled={selectedSlot === null || isEnriching || isPeekingOtherPlayer}
                    className={`w-full py-3 px-6 rounded-2xl font-black text-sm sm:text-base text-white shadow-xl transition-all duration-300 transform active:scale-95 disabled:opacity-40 disabled:scale-100 flex items-center justify-center gap-2 cursor-pointer ${
                      selectedSlot !== null && !isPeekingOtherPlayer ? 'keep-white' : ''
                    }`}
                    style={{
                      backgroundColor:
                        selectedSlot !== null && !isPeekingOtherPlayer
                          ? 'var(--color-primary)'
                          : 'var(--color-bg-surface-elevated)',
                      boxShadow:
                        selectedSlot !== null && !isPeekingOtherPlayer
                          ? 'var(--shadow-glow-primary)'
                          : 'none'
                    }}
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
                    {isPeekingOtherPlayer
                      ? `Viendo a ${displayedPlayer.name} (Vuelve para jugar)`
                      : selectedSlot === null
                      ? '1º Di qué canción es y toca una ranura [ + ]'
                      : '¡Revelar Año y Canción!'}
                  </button>

                  {/* Botón si nadie se la sabe y nadie quiere robarla */}
                  {!isPeekingOtherPlayer && (
                    <button
                      type="button"
                      onClick={handlePassTurnWithoutGuessing}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 border border-slate-700/60 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Nadie se la sabe o nadie la quiso robar. Pasa el turno a la siguiente persona"
                    >
                      <SkipForward className="w-3.5 h-3.5 text-slate-400" />
                      <span>🤷‍♂️ No me la sé / Pasar Turno</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2.5 w-full max-w-2xl">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <div
                      className={`px-3.5 py-2 rounded-xl border flex items-center gap-2 text-xs sm:text-sm font-bold ${
                        isCorrect
                          ? 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300'
                          : wasPassed
                          ? 'bg-slate-900/80 border-slate-700 text-slate-300'
                          : 'bg-rose-950/70 border-rose-500/60 text-rose-300'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                          <span>
                            ¡Año correcto ({currentTrack.year})! Carta sumada a {currentPlayer.name}
                          </span>
                        </>
                      ) : wasPassed ? (
                        <>
                          <span className="text-base">🤷‍♂️</span>
                          <span>
                            Turno pasado sin colocar. ¡Era "{currentTrack.title}" de {currentTrack.artist} ({currentTrack.year})!
                          </span>
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
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
                      className="px-5 py-2 rounded-xl font-black text-xs sm:text-sm text-slate-950 transition-transform active:scale-95 shadow-xl flex items-center gap-1.5 cursor-pointer"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    >
                      Siguiente Turno <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Validación Verbal Familiar (solo si no fue turno pasado) */}
                  {!wasPassed && (
                    <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                      <button
                        type="button"
                        disabled={bonusClaimedThisTurn}
                        onClick={handleAwardGuessBonus}
                        className={`px-3 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                          bonusClaimedThisTurn
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                            : 'bg-slate-800 hover:bg-slate-700 border-amber-500/40 text-amber-300'
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5" />
                        {bonusClaimedThisTurn
                          ? '¡+1 ⚡ Ficha entregada por acertar la canción!'
                          : '¿Dijo bien Canción y Artista en voz alta? (+1 ⚡)'}
                      </button>

                      {isCorrect && !cardRevokedThisTurn && (
                        <button
                          type="button"
                          onClick={handleRevokeCardForNotKnowingSong}
                          className="px-3 py-1.5 rounded-xl font-semibold bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 flex items-center gap-1 cursor-pointer"
                          title="Toca aquí si la regla familiar exige adivinar la canción para quedársela"
                        >
                          <Undo2 className="w-3.5 h-3.5" />
                          No se supo la canción (Quitar carta)
                        </button>
                      )}

                      {activeEvent?.exactYearBonus && isCorrect && !cardRevokedThisTurn && (
                        <button
                          type="button"
                          disabled={exactYearBonusClaimed}
                          onClick={handleAwardExactYearBonus}
                          className={`px-3 py-1.5 rounded-xl font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
                            exactYearBonusClaimed
                              ? 'bg-purple-950/40 border-purple-500/40 text-purple-300'
                              : 'bg-slate-800 hover:bg-slate-700 border-purple-500/40 text-purple-300'
                          }`}
                        >
                          <Trophy className="w-3.5 h-3.5 text-purple-400" />
                          {exactYearBonusClaimed
                            ? `¡+${activeEvent.exactYearBonus} ⚡ Entregadas por Año Exacto!`
                            : `¿Dijo el año exacto (${currentTrack.year})? (+${activeEvent.exactYearBonus} ⚡)`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Zona Inferior: Línea de Tiempo */}
            <div className="w-full">
              <div className="flex flex-wrap items-center justify-between gap-2 px-2 mb-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Línea de tiempo de {displayedPlayer.name} ({displayedPlayer.cards?.length || 0} canciones)
                  </span>
                  {isPeekingOtherPlayer && (
                    <button
                      type="button"
                      onClick={() => setViewingPlayerIndex(null)}
                      className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Volver a {currentPlayer.name}
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">
                  {isPeekingOtherPlayer
                    ? 'Modo vista previa'
                    : 'Toca una ranura [ + ] para ubicar el año'}
                </span>
              </div>

              <Timeline
                cards={displayedPlayer.cards || []}
                selectedIndex={isPeekingOtherPlayer ? null : selectedSlot}
                onSelectSlot={(idx) => {
                  if (!isRevealed && !isPeekingOtherPlayer) {
                    playSlotSelectSound();
                    setSelectedSlot(idx);
                  }
                }}
                isRevealed={isRevealed && !isPeekingOtherPlayer}
                correctSlotIndex={isPeekingOtherPlayer ? null : correctSlotIndex}
                eliminatedSlots={eliminatedSlots}
              />
            </div>
          </div>
        )}
      </main>

      {/* Modal para elegir quién ROBA la canción */}
      {showStealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-5 sm:p-6 rounded-3xl bg-slate-900 border border-amber-500/40 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-base sm:text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                ¡Robar Turno y Canción!
              </h3>
              <button
                onClick={() => setShowStealModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Si <strong>{currentPlayer.name}</strong> no se sabe esta canción, elige qué familiar gastará{' '}
              <strong>{activeEvent?.stealDiscount || 1} Ficha ⚡</strong> para robarla y acomodarla en su propio tablero:
            </p>

            <div className="space-y-2">
              {players.map((p, idx) => {
                if (idx === effectivePlayerIndex) return null;
                const cost = activeEvent?.stealDiscount || 1;
                const hasTokens = (p.tokens || 0) >= cost;
                return (
                  <button
                    key={p.id}
                    disabled={!hasTokens}
                    onClick={() => handleStealTurn(idx)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-violet-950/60 border border-slate-700 hover:border-amber-400 text-left transition-all disabled:opacity-40 cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-sm text-white block">{p.name}</span>
                      <span className="text-[11px] text-slate-400">
                        {p.cards?.length || 0} canciones en su línea del tiempo
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                      Usar {cost} ⚡ (Tiene {p.tokens || 0})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Emergente de Evento Sorpresa (Alerta a todos los jugadores) */}
      {showEventModal && activeEvent && (
        <SurpriseEventModal
          event={activeEvent}
          turnCount={turnCount}
          currentPlayer={currentPlayer}
          onClose={() => setShowEventModal(false)}
          onReroll={handleChangeEvent}
        />
      )}

      {/* Modal de Instrucciones de Juego */}
      <InstructionsModal
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />

      {/* Modal de Victoria / Fin de Partida con Medallas y Modo Libre */}
      {gameState === 'gameover' && (
        <GameOverModal
          winner={winner}
          players={players}
          isFinalEnd={isFinalEnd}
          onContinueEndless={handleContinueEndless}
          onRematch={() =>
            handleStartGame({
              players,
              targetCards,
              difficulty,
              turnTimerSeconds,
              enableEvents,
              eventProbability,
              playlistId: activePlaylistId
            })
          }
          onNewGame={() => {
            clearGameSession();
            setGameState('setup');
          }}
        />
      )}

      {/* Diálogo de Confirmación para Salir al Menú */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-center space-y-3.5">
            <div className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 w-11 h-11 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">¿Salir al menú principal?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Volverás a la configuración para cambiar de playlist o iniciar una nueva partida.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-3 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetGame}
                className="py-2 px-3 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 cursor-pointer"
              >
                Sí, salir al menú
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página sutil */}
      <footer className="w-full py-1.5 text-center text-[10px] text-slate-600 border-t border-slate-800/40">
        BeatLine • Pasa y Juega • Optimizado para Tablet
      </footer>
    </div>
  );
}
