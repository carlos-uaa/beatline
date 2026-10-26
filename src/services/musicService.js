/**
 * Servicio para obtener fragmentos de audio y portadas desde la API de iTunes
 * Incluye caché en memoria y localStorage para que el juego funcione rápido y sin lag.
 */

const CACHE_KEY = 'beatline_music_cache_v1';

function getStoredCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Error al leer caché de música:', e);
    return {};
  }
}

function saveToCache(key, data) {
  try {
    const current = getStoredCache();
    current[key] = data;
    localStorage.setItem(CACHE_KEY, JSON.stringify(current));
  } catch (e) {
    console.warn('Error al guardar en caché:', e);
  }
}

/**
 * Enriquece un objeto de canción con audio de preview y portada de alta resolución
 */
export async function enrichTrack(track) {
  const cacheKey = `${track.artist} - ${track.title}`.toLowerCase().trim();
  const cached = getStoredCache()[cacheKey];

  if (cached && cached.previewUrl) {
    return {
      ...track,
      ...cached,
      year: track.year || cached.year
    };
  }

  const query = encodeURIComponent(track.searchTerm || `${track.artist} ${track.title}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`iTunes HTTP ${res.status}`);
    const data = await res.json();

    if (data.resultCount > 0) {
      const item = data.results[0];
      const previewUrl = item.previewUrl;
      // Convertir artwork a mayor resolución (remplazar 100x100bb por 600x600bb)
      const artwork = (item.artworkUrl100 || '').replace('100x100bb', '600x600bb');
      const releaseYear = item.releaseDate ? new Date(item.releaseDate).getFullYear() : track.year;

      const enriched = {
        previewUrl,
        artwork,
        trackViewUrl: item.trackViewUrl,
        itunesTrackName: item.trackName,
        itunesArtistName: item.artistName,
        year: track.year || releaseYear // Priorizamos el año oficial curado si existe
      };

      saveToCache(cacheKey, enriched);

      return {
        ...track,
        ...enriched
      };
    }
  } catch (err) {
    console.warn(`No se pudo cargar preview en vivo para "${track.title}":`, err);
  }

  // Fallback si no hay conexión o no se encontró
  return {
    ...track,
    artwork: track.artwork || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    previewUrl: null
  };
}
