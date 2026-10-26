/**
 * Catálogo de Eventos Sorpresa y Giros de Tuerca para BeatLine
 * Se activan cada 4 turnos para mantener la adrenalina alta en partidas familiares.
 */

export const SURPRISE_EVENTS = [
  {
    id: 'doble-o-nada',
    title: '🔥 Turno Doble o Nada',
    badge: 'Doble o Nada',
    description: '¡Si aciertas la posición, ganas 2 CARTAS de golpe! Pero si fallas, pierdes 0.5 ⚡ fichas.',
    color: '#f97316',
    rewardCards: 2,
    penaltyTokens: 0.5
  },
  {
    id: 'intro-relampago',
    title: '🤫 Intro Relámpago (5 Segundos)',
    badge: 'Intro 5s',
    description: '¡Solo sonarán los primeros 5 segundos de la pista! Si logras ubicarla así, ganas la carta y +1 ⚡ Ficha extra.',
    color: '#8b5cf6',
    maxDuration: 5,
    bonusToken: 1
  },
  {
    id: 'fiebre-fichas',
    title: '⚡ Fiebre de Fichas',
    badge: '+1.5 ⚡',
    description: '¡Oportunidad de oro! Si aciertas la posición cronológica en este turno, recibes +1.5 ⚡ Fichas.',
    color: '#eab308',
    bonusToken: 1.5
  },
  {
    id: 'turno-blindado',
    title: '🛡️ Escudo Protector (Margen ±3 años)',
    badge: 'Margen ±3 años',
    description: 'En este turno tienes inmunidad: si no le atinas a la ranura exacta pero quedas a ±3 años de la carta más cercana, ¡te la llevas!',
    color: '#06b6d4',
    marginTolerance: 3
  },
  {
    id: 'pista-gratis',
    title: '🎁 Pista Visual de la Casa',
    badge: 'Pista Gratis',
    description: '¡La tablet te regala la Pista 1 gratis! Podrás ver la portada borrosa y la inicial del artista sin gastar fichas.',
    color: '#10b981',
    freeHint: true
  },
  {
    id: 'todos-juegan',
    title: '🔄 Duelo Relámpago: Todos Juegan',
    badge: 'Todos Juegan',
    description: 'Antes de revelar, todos los demás jugadores dicen un año exacto en voz alta. ¡El que más se acerque al año real gana +1 ⚡ Ficha!',
    color: '#ec4899',
    allPlayDuel: true
  },
  {
    id: 'robo-descuento',
    title: '🕵️ Gran Oferta de Robo (0.5 ⚡)',
    badge: 'Robo a Mitad',
    description: 'Si el jugador en turno no se sabe la canción, cualquier otro familiar puede robarla por solo 0.5 ⚡ Fichas.',
    color: '#f43f5e',
    stealDiscount: 0.5
  }
];

export function getRandomSurpriseEvent(currentEventId = null) {
  const pool = SURPRISE_EVENTS.filter(e => e.id !== currentEventId);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
