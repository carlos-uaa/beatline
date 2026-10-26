import { ANIVERSARIO_PAPAS_TRACKS } from '../data/aniversarioPapas';

const CUSTOM_PLAYLISTS_KEY = 'beatline_custom_playlists_v1';

// Playlist Principal Oficial (Aniversario Papás)
export const DEFAULT_MAIN_PLAYLIST = {
  id: 'aniversario-papas',
  title: 'Aniversario Papás 🎵',
  description: 'Lista familiar con éxitos de pop, urbano, reggaetón y clásicos inolvidables.',
  cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
  tracks: ANIVERSARIO_PAPAS_TRACKS
};

export const DEFAULT_PLAYLISTS = [
  DEFAULT_MAIN_PLAYLIST
];

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
  return [...DEFAULT_PLAYLISTS, ...getCustomPlaylists()];
}

export function getPlaylistById(id) {
  const all = getAllPlaylists();
  return all.find((p) => p.id === id) || DEFAULT_MAIN_PLAYLIST;
}
