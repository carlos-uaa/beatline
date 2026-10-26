/**
 * Servicio de Persistencia Antifallos para BeatLine
 * Garantiza que si alguien refresca la página, apaga la tablet o cambia de app por error,
 * la partida en curso se restaura automáticamente sin perder el turno ni las cartas.
 */

const STORAGE_KEY = 'beatline_game_session_v1';

export function saveGameSession(sessionState) {
  try {
    if (!sessionState) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const payload = {
      ...sessionState,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error('Error al guardar sesión de partida:', err);
  }
}

export function loadGameSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session;
  } catch (err) {
    console.error('Error al recuperar sesión de partida:', err);
    return null;
  }
}

export function clearGameSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Error al limpiar sesión:', err);
  }
}

export function hasActiveSession() {
  const session = loadGameSession();
  return Boolean(session && session.players && session.players.length > 0 && !session.isGameOver);
}
