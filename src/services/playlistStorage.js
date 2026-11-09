import { MIX_COMPLETO_TRACKS } from '../data/mixCompleto';

const CUSTOM_PLAYLISTS_KEY = 'beatline_custom_playlists_v1';
const SYNCED_DEFAULTS_KEY = 'beatline_synced_defaults_v1';

// Playlist Principal Oficial (Mix Completo conectado a Spotify)
export const DEFAULT_MAIN_PLAYLIST = {
  id: 'mix-completo',
  title: 'Mix Completo 🎵',
  description: 'Lista oficial basada en Spotify con más de 240 canciones: pop, reggaetón, clásicos, urbano y éxitos.',
  cover: 'https://mosaic.scdn.co/640/ab67616d00001e021df4a6df45ab77ef61e2e1ffab67616d00001e026f568261be22bda6f5b1aa49ab67616d00001e028cf8d07d28153e9f41caa54aab67616d00001e02bb674d8dfddfc19c2af3b9fe',
  tracks: MIX_COMPLETO_TRACKS,
  spotifyPlaylistId: '1WLeNGCJGpc5MDDzzscP0q',
  spotifyUrl: 'https://open.spotify.com/playlist/1WLeNGCJGpc5MDDzzscP0q?si=88dd9c015e5c4d5e',
  isOfficial: true
};

export const DEFAULT_PLAYLISTS = [
  DEFAULT_MAIN_PLAYLIST
];

function getSyncedDefaults() {
  try {
    const raw = localStorage.getItem(SYNCED_DEFAULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSyncedDefaults(synced) {
  try {
    localStorage.setItem(SYNCED_DEFAULTS_KEY, JSON.stringify(synced));
  } catch (e) {
    console.warn('Error guardando synced defaults:', e);
  }
}

export function getCustomPlaylists() {
  try {
    const raw = localStorage.getItem(CUSTOM_PLAYLISTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPlaylist(playlist) {
  try {
    const current = getCustomPlaylists();
    const filtered = current.filter((p) => p.id !== playlist.id);
    const updated = [playlist, ...filtered];
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Error guardando playlist:', err);
    return [];
  }
}

export function deleteCustomPlaylist(playlistId) {
  try {
    const current = getCustomPlaylists();
    const updated = current.filter((p) => p.id !== playlistId);
    localStorage.setItem(CUSTOM_PLAYLISTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function getAllPlaylists() {
  const syncedDefaults = getSyncedDefaults();
  const defaults = DEFAULT_PLAYLISTS.map((pl) => {
    if (syncedDefaults[pl.id]) {
      return {
        ...pl,
        ...syncedDefaults[pl.id],
        // Preservar los campos esenciales oficiales
        id: pl.id,
        isOfficial: true,
        spotifyPlaylistId: pl.spotifyPlaylistId,
        spotifyUrl: pl.spotifyUrl
      };
    }
    return pl;
  });

  return [...defaults, ...getCustomPlaylists()];
}

export function getPlaylistById(id) {
  const all = getAllPlaylists();
  return all.find((p) => p.id === id) || all.find((p) => p.id === 'mix-completo') || DEFAULT_MAIN_PLAYLIST;
}

/**
 * Normaliza título y artista para comparar de manera precisa canciones
 */
function normalizeSongKey(title, artist) {
  const clean = (str) =>
    String(str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
  return `${clean(title)}___${clean(artist)}`;
}

/**
 * Sincroniza una playlist que tenga spotifyPlaylistId con Spotify:
 * Compara canciones existentes vs nuevas, detecta agregadas y eliminadas,
 * y persiste los cambios.
 */
export async function syncSpotifyPlaylist(playlist, userToken = null) {
  const playlistId = playlist.spotifyPlaylistId || playlist.id;
  if (!playlistId) {
    throw new Error('Esta playlist no tiene un identificador de Spotify vinculado.');
  }

  let endpoint = `/api/spotify?id=${encodeURIComponent(playlistId)}`;
  if (userToken) {
    endpoint += `&token=${encodeURIComponent(userToken)}`;
  }

  const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};
  const res = await fetch(endpoint, { headers });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error al sincronizar con Spotify (HTTP ${res.status})`);
  }

  const data = await res.json();
  const remoteTracks = data.tracks || [];

  if (remoteTracks.length === 0) {
    throw new Error('Spotify no devolvió canciones para esta playlist.');
  }

  const currentTracks = playlist.tracks || [];

  // Mapear existentes
  const existingMap = new Map();
  for (const t of currentTracks) {
    existingMap.set(normalizeSongKey(t.title, t.artist), t);
  }

  // Mapear nuevas
  const remoteMap = new Map();
  const updatedTracks = remoteTracks.map((item, idx) => {
    const key = normalizeSongKey(item.title, item.artist);
    const existing = existingMap.get(key);

    const trackObj = {
      id: existing?.id || `sp-${playlistId}-${idx + 1}-${Date.now()}`,
      title: item.title,
      artist: item.artist,
      searchTerm: `${item.artist} ${item.title}`,
      previewUrl: item.audioPreviewUrl || existing?.previewUrl || null,
      year: item.year || existing?.year || null
    };

    remoteMap.set(key, trackObj);
    return trackObj;
  });

  // Detectar agregadas y eliminadas
  const added = [];
  for (const [key, track] of remoteMap.entries()) {
    if (!existingMap.has(key)) {
      added.push(track);
    }
  }

  const removed = [];
  for (const [key, track] of existingMap.entries()) {
    if (!remoteMap.has(key)) {
      removed.push(track);
    }
  }

  const updatedPlaylist = {
    ...playlist,
    title: data.title || playlist.title,
    cover: data.cover || playlist.cover,
    tracks: updatedTracks,
    lastSyncedAt: Date.now()
  };

  // Guardar en la ubicación adecuada
  if (playlist.isOfficial || playlist.id === 'mix-completo') {
    const syncedDefaults = getSyncedDefaults();
    syncedDefaults[playlist.id] = {
      title: updatedPlaylist.title,
      cover: updatedPlaylist.cover,
      tracks: updatedPlaylist.tracks,
      lastSyncedAt: updatedPlaylist.lastSyncedAt
    };
    saveSyncedDefaults(syncedDefaults);
  } else {
    saveCustomPlaylist(updatedPlaylist);
  }

  return {
    success: true,
    updatedPlaylist,
    addedCount: added.length,
    removedCount: removed.length,
    addedTracks: added.map((t) => `${t.title} (${t.artist})`),
    removedTracks: removed.map((t) => `${t.title} (${t.artist})`),
    totalCount: updatedTracks.length
  };
}
