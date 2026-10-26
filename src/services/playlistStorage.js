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
    { id: 'lat-6', title: 'Cómo Te Voy a Olvidar', artist: 'Los Ángeles Azules', year: 1996, searchTerm: 'Los Angeles Azules Como Te Voy a Olvidar' },
    { id: 'lat-7', title: 'Suavemente', artist: 'Elvis Crespo', year: 1998, searchTerm: 'Elvis Crespo Suavemente' },
    { id: 'lat-8', title: 'Ciega, Sordomuda', artist: 'Shakira', year: 1998, searchTerm: 'Shakira Ciega Sordomuda' },
    { id: 'lat-9', title: 'El Meneaito', artist: 'Gaby', year: 1996, searchTerm: 'El Meneaito Gaby' },
    { id: 'lat-10', title: 'La Vida Es Un Carnaval', artist: 'Celia Cruz', year: 1998, searchTerm: 'Celia Cruz La Vida Es Un Carnaval' },
    { id: 'lat-11', title: 'Aserejé', artist: 'Las Ketchup', year: 2002, searchTerm: 'Las Ketchup Asereje' },
    { id: 'lat-12', title: 'Rosas', artist: 'La Oreja de Van Gogh', year: 2003, searchTerm: 'La Oreja de Van Gogh Rosas' },
    { id: 'lat-13', title: 'La Camisa Negra', artist: 'Juanes', year: 2004, searchTerm: 'Juanes La Camisa Negra' },
    { id: 'lat-14', title: 'Gasolina', artist: 'Daddy Yankee', year: 2004, searchTerm: 'Daddy Yankee Gasolina' },
    { id: 'lat-15', title: 'Labios Compartidos', artist: 'Maná', year: 2006, searchTerm: 'Mana Labios Compartidos' },
    { id: 'lat-16', title: 'Danza Kuduro', artist: 'Don Omar', year: 2010, searchTerm: 'Don Omar Danza Kuduro' },
    { id: 'lat-17', title: 'Vivir Mi Vida', artist: 'Marc Anthony', year: 2013, searchTerm: 'Marc Anthony Vivir Mi Vida' },
    { id: 'lat-18', title: 'Bailando', artist: 'Enrique Iglesias', year: 2014, searchTerm: 'Enrique Iglesias Bailando' },
    { id: 'lat-19', title: 'Despacito', artist: 'Luis Fonsi & Daddy Yankee', year: 2017, searchTerm: 'Luis Fonsi Despacito' },
    { id: 'lat-20', title: 'Tusa', artist: 'KAROL G & Nicki Minaj', year: 2019, searchTerm: 'Karol G Tusa' },
    { id: 'lat-21', title: 'Pepas', artist: 'Farruko', year: 2021, searchTerm: 'Farruko Pepas' },
    { id: 'lat-22', title: 'Tití Me Preguntó', artist: 'Bad Bunny', year: 2022, searchTerm: 'Bad Bunny Titi Me Pregunto' },
    { id: 'lat-23', title: 'Provenza', artist: 'KAROL G', year: 2022, searchTerm: 'Karol G Provenza' }
  ]
};

export const ROCK_ESPANOL_PLAYLIST = {
  id: 'rock-en-tu-idioma',
  title: 'Rock en tu Idioma 🎸',
  description: 'Himnos legendarios del rock latino y español de los 80s, 90s y 2000s.',
  cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&auto=format&fit=crop&q=80',
  tracks: [
    { id: 'rock-1', title: 'Persiana Americana', artist: 'Soda Stereo', year: 1986, searchTerm: 'Soda Stereo Persiana Americana' },
    { id: 'rock-2', title: 'Devuélveme a mi chica', artist: 'Hombres G', year: 1985, searchTerm: 'Hombres G Devuelveme a mi chica' },
    { id: 'rock-3', title: 'Cuando Pase el Temblor', artist: 'Soda Stereo', year: 1985, searchTerm: 'Soda Stereo Cuando Pase el Temblor' },
    { id: 'rock-4', title: 'La Célula Que Explota', artist: 'Caifanes', year: 1990, searchTerm: 'Caifanes La Celula Que Explota' },
    { id: 'rock-5', title: 'Entre Dos Tierras', artist: 'Héroes del Silencio', year: 1990, searchTerm: 'Heroes del Silencio Entre Dos Tierras' },
    { id: 'rock-6', title: 'Mujer Amante', artist: 'Rata Blanca', year: 1990, searchTerm: 'Rata Blanca Mujer Amante' },
    { id: 'rock-7', title: 'Mariposa Tecknicolor', artist: 'Fito Páez', year: 1994, searchTerm: 'Fito Paez Mariposa Tecknicolor' },
    { id: 'rock-8', title: 'Afuera', artist: 'Caifanes', year: 1994, searchTerm: 'Caifanes Afuera' },
    { id: 'rock-9', title: 'Matador', artist: 'Los Fabulosos Cadillacs', year: 1993, searchTerm: 'Los Fabulosos Cadillacs Matador' },
    { id: 'rock-10', title: 'La Flaca', artist: 'Jarabe de Palo', year: 1996, searchTerm: 'Jarabe de Palo La Flaca' },
    { id: 'rock-11', title: 'Flaca', artist: 'Andrés Calamaro', year: 1997, searchTerm: 'Andres Calamaro Flaca' },
    { id: 'rock-12', title: 'Gimme Tha Power', artist: 'Molotov', year: 1997, searchTerm: 'Molotov Gimme Tha Power' },
    { id: 'rock-13', title: 'Puente', artist: 'Gustavo Cerati', year: 1999, searchTerm: 'Gustavo Cerati Puente' },
    { id: 'rock-14', title: 'Irresponsables', artist: 'Babasónicos', year: 2003, searchTerm: 'Babasonicos Irresponsables' },
    { id: 'rock-15', title: 'Eres', artist: 'Café Tacvba', year: 2003, searchTerm: 'Cafe Tacvba Eres' },
    { id: 'rock-16', title: 'Soñé', artist: 'Zoé', year: 2003, searchTerm: 'Zoe Sone' },
    { id: 'rock-17', title: 'Crimen', artist: 'Gustavo Cerati', year: 2006, searchTerm: 'Gustavo Cerati Crimen' },
    { id: 'rock-18', title: 'Labios Rotos', artist: 'Zoé', year: 2011, searchTerm: 'Zoe Labios Rotos' },
    { id: 'rock-19', title: 'Brillas', artist: 'León Larregui', year: 2012, searchTerm: 'Leon Larregui Brillas' }
  ]
};

export const REGGAETON_HISTORICO_PLAYLIST = {
  id: 'reggaeton-historico',
  title: 'Reggaetón Histórico 🔥',
  description: 'Desde la vieja escuela de Puerto Rico hasta los perreos modernos.',
  cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&auto=format&fit=crop&q=80',
  tracks: [
    { id: 'reg-1', title: 'Pa’ Que Retozen', artist: 'Tego Calderón', year: 2002, searchTerm: 'Tego Calderon Pa Que Retozen' },
    { id: 'reg-2', title: 'Dile', artist: 'Don Omar', year: 2003, searchTerm: 'Don Omar Dile' },
    { id: 'reg-3', title: 'Lo Que Pasó, Pasó', artist: 'Daddy Yankee', year: 2004, searchTerm: 'Daddy Yankee Lo Que Paso Paso' },
    { id: 'reg-4', title: 'Pobre Diabla', artist: 'Don Omar', year: 2003, searchTerm: 'Don Omar Pobre Diabla' },
    { id: 'reg-5', title: 'Rakata', artist: 'Wisin & Yandel', year: 2005, searchTerm: 'Wisin Yandel Rakata' },
    { id: 'reg-6', title: 'Atrévete-Te-Te', artist: 'Calle 13', year: 2005, searchTerm: 'Calle 13 Atrevete' },
    { id: 'reg-7', title: 'Salió El Sol', artist: 'Don Omar', year: 2006, searchTerm: 'Don Omar Salio El Sol' },
    { id: 'reg-8', title: 'Llamado de Emergencia', artist: 'Daddy Yankee', year: 2008, searchTerm: 'Daddy Yankee Llamado de Emergencia' },
    { id: 'reg-9', title: 'Te Pintaron Pajaritos', artist: 'Yandar & Yostin', year: 2012, searchTerm: 'Yandar Yostin Te Pintaron Pajaritos' },
    { id: 'reg-10', title: '6 AM', artist: 'J Balvin & Farruko', year: 2013, searchTerm: 'J Balvin Farruko 6 AM' },
    { id: 'reg-11', title: 'El Perdón', artist: 'Nicky Jam & Enrique Iglesias', year: 2015, searchTerm: 'Nicky Jam El Perdon' },
    { id: 'reg-12', title: 'Borro Cassette', artist: 'Maluma', year: 2015, searchTerm: 'Maluma Borro Cassette' },
    { id: 'reg-13', title: 'Otra Vez', artist: 'Zion & Lennox feat. J Balvin', year: 2016, searchTerm: 'Zion Lennox Otra Vez' },
    { id: 'reg-14', title: 'Me Rehúso', artist: 'Danny Ocean', year: 2016, searchTerm: 'Danny Ocean Me Rehuso' },
    { id: 'reg-15', title: 'Mi Gente', artist: 'J Balvin & Willy William', year: 2017, searchTerm: 'J Balvin Mi Gente' },
    { id: 'reg-16', title: 'Te Boté (Remix)', artist: 'Nio García, Casper Mágico, Bad Bunny', year: 2018, searchTerm: 'Te Bote Remix Bad Bunny Nicky Jam' },
    { id: 'reg-17', title: 'Callaíta', artist: 'Bad Bunny & Tainy', year: 2019, searchTerm: 'Bad Bunny Callaita' },
    { id: 'reg-18', title: 'Safaera', artist: 'Bad Bunny', year: 2020, searchTerm: 'Bad Bunny Safaera' },
    { id: 'reg-19', title: 'Todo De Ti', artist: 'Rauw Alejandro', year: 2021, searchTerm: 'Rauw Alejandro Todo De Ti' },
    { id: 'reg-20', title: 'Feliz Cumpleaños Ferxxo', artist: 'Feid', year: 2022, searchTerm: 'Feid Feliz Cumpleanos Ferxxo' },
    { id: 'reg-21', title: 'LUNA', artist: 'Feid & ATL Jacob', year: 2023, searchTerm: 'Feid Luna' }
  ]
};

export const POP_GLOBAL_PLAYLIST = {
  id: 'pop-hits-globales',
  title: 'Pop & Hits Mundiales 🌍',
  description: 'Los mayores éxitos internacionales en inglés desde los 80s hasta la actualidad.',
  cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&auto=format&fit=crop&q=80',
  tracks: [
    { id: 'pop-1', title: 'Billie Jean', artist: 'Michael Jackson', year: 1982, searchTerm: 'Michael Jackson Billie Jean' },
    { id: 'pop-2', title: 'Take On Me', artist: 'a-ha', year: 1984, searchTerm: 'a-ha Take On Me' },
    { id: 'pop-3', title: 'Smells Like Teen Spirit', artist: 'Nirvana', year: 1991, searchTerm: 'Nirvana Smells Like Teen Spirit' },
    { id: 'pop-4', title: 'Wannabe', artist: 'Spice Girls', year: 1996, searchTerm: 'Spice Girls Wannabe' },
    { id: 'pop-5', title: '...Baby One More Time', artist: 'Britney Spears', year: 1998, searchTerm: 'Britney Spears Baby One More Time' },
    { id: 'pop-6', title: 'Yellow', artist: 'Coldplay', year: 2000, searchTerm: 'Coldplay Yellow' },
    { id: 'pop-7', title: 'In the End', artist: 'Linkin Park', year: 2000, searchTerm: 'Linkin Park In the End' },
    { id: 'pop-8', title: 'One More Time', artist: 'Daft Punk', year: 2000, searchTerm: 'Daft Punk One More Time' },
    { id: 'pop-9', title: 'Hips Don’t Lie', artist: 'Shakira', year: 2006, searchTerm: 'Shakira Hips Dont Lie' },
    { id: 'pop-10', title: 'Viva La Vida', artist: 'Coldplay', year: 2008, searchTerm: 'Coldplay Viva La Vida' },
    { id: 'pop-11', title: 'Bad Romance', artist: 'Lady Gaga', year: 2009, searchTerm: 'Lady Gaga Bad Romance' },
    { id: 'pop-12', title: 'Rolling in the Deep', artist: 'Adele', year: 2010, searchTerm: 'Adele Rolling in the Deep' },
    { id: 'pop-13', title: 'Wake Me Up', artist: 'Avicii', year: 2013, searchTerm: 'Avicii Wake Me Up' },
    { id: 'pop-14', title: 'Uptown Funk', artist: 'Mark Ronson feat. Bruno Mars', year: 2014, searchTerm: 'Mark Ronson Bruno Mars Uptown Funk' },
    { id: 'pop-15', title: 'Shape of You', artist: 'Ed Sheeran', year: 2017, searchTerm: 'Ed Sheeran Shape of You' },
    { id: 'pop-16', title: 'Blinding Lights', artist: 'The Weeknd', year: 2019, searchTerm: 'The Weeknd Blinding Lights' },
    { id: 'pop-17', title: 'Don’t Start Now', artist: 'Dua Lipa', year: 2019, searchTerm: 'Dua Lipa Dont Start Now' },
    { id: 'pop-18', title: 'Dynamite', artist: 'BTS', year: 2020, searchTerm: 'BTS Dynamite' },
    { id: 'pop-19', title: 'As It Was', artist: 'Harry Styles', year: 2022, searchTerm: 'Harry Styles As It Was' },
    { id: 'pop-20', title: 'Flowers', artist: 'Miley Cyrus', year: 2023, searchTerm: 'Miley Cyrus Flowers' }
  ]
};

export const DEFAULT_PLAYLISTS = [
  URBAN_ARGENTINA_PLAYLIST,
  FAMILY_LATIN_PLAYLIST,
  ROCK_ESPANOL_PLAYLIST,
  REGGAETON_HISTORICO_PLAYLIST,
  POP_GLOBAL_PLAYLIST
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
