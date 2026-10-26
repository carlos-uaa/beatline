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
    description: '¡Nadie se distrae! Mientras el jugador en turno ubica su carta, los demás dicen un año en voz alta. El más cercano gana +1 ⚡ Ficha (o la carta si el jugador falla). ¡El jugador en turno no pierde su oportunidad!',
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
  },
  {
    id: 'lluvia-fichas',
    title: '🌧️ Lluvia de Fichas (Regalo Familiar)',
    badge: '+1 ⚡ Para Todos',
    description: '¡Celebración en la mesa! Al activarse este evento, ¡TODOS los jugadores reciben de inmediato +1 ⚡ Ficha de regalo!',
    color: '#38bdf8',
    allGetTokens: 1
  },
  {
    id: 'salto-temporal',
    title: '⏳ Salto Temporal (Pista 2 Gratis)',
    badge: 'Pista 2 Gratis',
    description: '¡La tablet te regala la Pista 2 sin costo! Se descartan automáticamente la mitad de las ranuras incorrectas de tu tablero.',
    color: '#14b8a6',
    freeSlotElimination: true
  },
  {
    id: 'ano-exacto',
    title: '🎯 Apuesta de Año Exacto (+2 ⚡ Extra)',
    badge: 'Bono +2 ⚡',
    description: 'Si colocas la canción en la ranura correcta y además dices en voz alta el AÑO EXACTO antes de revelar, ¡te llevas la carta + 2 ⚡ Fichas extra!',
    color: '#a855f7',
    exactYearBonus: 2
  },
  {
    id: 'segunda-oportunidad',
    title: '🔄 Segunda Oportunidad (Reintento)',
    badge: 'Reintento Gratis',
    description: '¡Tienes salvavidas! Si fallas tu primer intento al ubicar la ranura, la tablet te dará un segundo intento inmediato.',
    color: '#22c55e',
    secondChance: true
  },
  {
    id: 'duo-solidario',
    title: '🤝 Dúo Musical (Pase Solidario)',
    badge: 'Trabajo en Equipo',
    description: '¡Puedes consultar y pedir ayuda a otro familiar! Si entre los dos la colocan bien, ambos ganan +0.5 ⚡ Fichas.',
    color: '#f59e0b',
    duoBonus: 0.5
  }
];

export function getRandomSurpriseEvent(currentEventId = null) {
  const pool = SURPRISE_EVENTS.filter(e => e.id !== currentEventId);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
