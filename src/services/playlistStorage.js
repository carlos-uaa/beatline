import { URBAN_ARGENTINA_PLAYLIST } from '../data/urbanArgentina';

const CUSTOM_PLAYLISTS_KEY = 'beatline_custom_playlists_v1';

export const FAMILY_LATIN_PLAYLIST = {
  id: 'fiesta-latina-familiar',
  title: 'Clásicos & Fiesta Familiar 🎉',
  description: 'Éxitos inolvidables en español desde los 80s hasta hoy para todas las generaciones.',
  cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&auto=format&fit=crop&q=80',
  tracks: [
    { id: 'lat-1', title: 'Ahora Te Puedes Marchar', artist: 'Luis Miguel', year: 1987, searchTerm: 'Luis Miguel Ahora Te Puedes Marchar' },
    { id: 'lat-2', title: 'De Música Ligera', artist: 'Soda Stereo', year: 1990, searchTerm: 'Soda Stereo De Musica Ligera' },
    { id: 'lat-3', title: 'Lamento Boliviano', artist: 'Los Enanitos Verdes', year: 1994, searchTerm: 'Enanitos Verdes Lamento Boliviano' },
    { id: 'lat-4', title: 'Amor Prohibido', artist: 'Selena', year: 1994, searchTerm: 'Selena Amor Prohibido' },
    { id: 'lat-5', title: 'La Ingrata', artist: 'Café Tacvba', year: 1994, searchTerm: 'Cafe Tacvba La Ingrata' },
    { id: 'lat-6', title: 'Suavemente', artist: 'Elvis Crespo', year: 1998, searchTerm: 'Elvis Crespo Suavemente' },
    { id: 'lat-7', title: 'Ciega, Sordomuda', artist: 'Shakira', year: 1998, searchTerm: 'Shakira Ciega Sordomuda' },
    { id: 'lat-8', title: 'Cómo Te Voy a Olvidar', artist: 'Los Ángeles Azules', year: 1996, searchTerm: 'Los Angeles Azules Como Te Voy a Olvidar' },
    { id: 'lat-9', title: 'La Camisa Negra', artist: 'Juanes', year: 2004, searchTerm: 'Juanes La Camisa Negra' },
    { id: 'lat-10', title: 'Gasolina', artist: 'Daddy Yankee', year: 2004, searchTerm: 'Daddy Yankee Gasolina' },
    { id: 'lat-11', title: 'Rosas', artist: 'La Oreja de Van Gogh', year: 2003, searchTerm: 'La Oreja de Van Gogh Rosas' },
    { id: 'lat-12', title: 'Labios Compartidos', artist: 'Maná', year: 2006, searchTerm: 'Mana Labios Compartidos' },
    { id: 'lat-13', title: 'Danza Kuduro', artist: 'Don Omar', year: 2010, searchTerm: 'Don Omar Danza Kuduro' },
    { id: 'lat-14', title: 'Bailando', artist: 'Enrique Iglesias', year: 2014, searchTerm: 'Enrique Iglesias Bailando' },
    { id: 'lat-15', title: 'Despacito', artist: 'Luis Fonsi & Daddy Yankee', year: 2017, searchTerm: 'Luis Fonsi Despacito' },
    { id: 'lat-16', title: 'Tusa', artist: 'KAROL G & Nicki Minaj', year: 2019, searchTerm: 'Karol G Tusa' },
    { id: 'lat-17', title: 'Tití Me Preguntó', artist: 'Bad Bunny', year: 2022, searchTerm: 'Bad Bunny Titi Me Pregunto' },
    { id: 'lat-18', title: 'Provenza', artist: 'KAROL G', year: 2022, searchTerm: 'Karol G Provenza' }
  ]
};

export const DEFAULT_PLAYLISTS = [
  URBAN_ARGENTINA_PLAYLIST,
  FAMILY_LATIN_PLAYLIST
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
  return all.find((p) => p.id === id) || URBAN_ARGENTINA_PLAYLIST;
}
