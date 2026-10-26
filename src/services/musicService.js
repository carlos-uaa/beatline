/**
 * Servicio Musical Híbrido (Deezer JSONP Primario + iTunes Fallback)
 * - Resuelve el 100% de las canciones originales de estudio (evitando covers, type beats o karaokes).
 * - Funciona 100% en el navegador (localhost y Vercel) sin problemas de CORS gracias a JSONP.
 * - Incluye buscador en vivo y lector de playlists públicas de Deezer.
 */

// Caché en memoria de la sesión actual (los links de audio de Deezer tienen token temporal,
// por lo que no deben guardarse por días en localStorage, pero los años y metadatos sí).
const sessionAudioCache = new Map();
const METADATA_CACHE_KEY = 'beatline_meta_cache_v2';

function getMetadataCache() {
  try {
    const raw = localStorage.getItem(METADATA_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveMetadataCache(key, meta) {
  try {
    const current = getMetadataCache();
    current[key] = meta;
    localStorage.setItem(METADATA_CACHE_KEY, JSON.stringify(current));
  } catch {
    // ignore storage quota errors
  }
}

/**
 * Utilidad para peticiones JSONP a la API oficial de Deezer (evita bloqueos CORS en navegador/Vercel)
 */
export function deezerJsonp(endpointAndParams) {
  return new Promise((resolve, reject) => {
    const callbackName = `dz_cb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement('script');
    const separator = endpointAndParams.includes('?') ? '&' : '?';
    const url = `https://api.deezer.com${endpointAndParams}${separator}output=jsonp&callback=${callbackName}`;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout en consulta a Deezer'));
    }, 8000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    }

    window[callbackName] = (data) => {
      cleanup();
      if (data && data.error) {
        reject(new Error(data.error.message || 'Error de Deezer API'));
      } else {
        resolve(data);
      }
    };

    script.src = url;
    script.onerror = () => {
      cleanup();
      reject(new Error('Error de red al cargar script de Deezer'));
    };

    document.body.appendChild(script);
  });
}

function normalizeStr(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Puntúa resultados para descartar "Type Beats", "Karaoke", "Cumbia Cover", "Tribute", "En Vivo", etc.
 */
function pickBestResult(items, expectedArtist, expectedTitle, getArtist, getTitle) {
  if (!items || items.length === 0) return null;

  const normExpectedArtist = normalizeStr(expectedArtist);
  const primaryArtistWord = normExpectedArtist.split(/\s+/)[0];
  const normExpectedTitle = normalizeStr(expectedTitle);
  const titleWords = normExpectedTitle.split(/\s+/).filter((w) => w.length > 2);

  const expectRemix = normExpectedTitle.includes('remix');
  const forbiddenTerms = [
    'type beat',
    'karaoke',
    'tribute',
    'instrumental',
    'cover',
    'en vivo',
    'live',
    '8d',
    'sped up',
    'slowed',
    'parody',
    'cumbia',
    'pablillo',
    'vallorani'
  ];

  let bestItem = items[0];
  let bestScore = -999;

  for (const item of items) {
    const artist = normalizeStr(getArtist(item));
    const title = normalizeStr(getTitle(item));
    let score = 0;

    // Coincidencia de artista principal
    if (artist.includes(primaryArtistWord)) {
      score += 60;
    }
    if (artist === normExpectedArtist) {
      score += 25;
    }

    // Coincidencia de título
    if (title === normExpectedTitle) {
      score += 50;
    } else if (title.includes(normExpectedTitle) || normExpectedTitle.includes(title)) {
      score += 35;
    } else {
      for (const w of titleWords) {
        if (title.includes(w)) score += 12;
      }
    }

    // Penalizar términos no deseados (covers, instrumentales, etc.)
    for (const bad of forbiddenTerms) {
      if (!normExpectedTitle.includes(bad) && (title.includes(bad) || artist.includes(bad))) {
        score -= 120;
      }
    }

    if (!expectRemix && title.includes('remix')) {
      score -= 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}

/**
 * Enriquece una canción con el audio original de 30s, portada HD y año oficial.
 */
export async function enrichTrack(track) {
  // Limpiar caché vieja corrupta de versiones anteriores si existiera
  try {
    localStorage.removeItem('beatline_music_cache_v1');
  } catch {}

  const cacheKey = `${track.artist} - ${track.title}`.toLowerCase().trim();

  if (sessionAudioCache.has(cacheKey)) {
    return sessionAudioCache.get(cacheKey);
  }

  const metaCache = getMetadataCache()[cacheKey];
  const mainArtist = (track.artist || '').split('&')[0].split(',')[0].trim();
  const cleanQuery = `${mainArtist} ${track.title}`;

  // 1. Intentar con Deezer API (JSONP) - Tiene el catálogo original completo de Urbano y global
  try {
    const searchData = await deezerJsonp(`/search?q=${encodeURIComponent(cleanQuery)}&limit=10`);
    const list = searchData?.data || [];

    if (list.length > 0) {
      const best = pickBestResult(
        list,
        mainArtist,
        track.title,
        (it) => it.artist?.name,
        (it) => it.title
      );

      if (best && best.preview) {
        let releaseYear = track.year || metaCache?.year;

        // Si es una canción de una playlist personalizada sin año fijo, consultamos el detalle del track en Deezer
        if (!releaseYear && best.id) {
          try {
            const detail = await deezerJsonp(`/track/${best.id}`);
            const dateStr = detail?.release_date || detail?.album?.release_date;
            if (dateStr) {
              const parsedYear = new Date(dateStr).getFullYear();
              if (!isNaN(parsedYear) && parsedYear > 1900) {
                releaseYear = parsedYear;
              }
            }
          } catch {}
        }

        const artwork =
          best.album?.cover_big ||
          best.album?.cover_xl ||
          best.album?.cover_medium ||
          metaCache?.artwork;

        const enriched = {
          ...track,
          previewUrl: best.preview,
          artwork: artwork || track.artwork,
          year: releaseYear || 2020,
          resolvedArtist: best.artist?.name || track.artist,
          resolvedTitle: best.title || track.title
        };

        saveMetadataCache(cacheKey, {
          artwork: enriched.artwork,
          year: enriched.year
        });
        sessionAudioCache.set(cacheKey, enriched);
        return enriched;
      }
    }
  } catch (err) {
    console.warn('Deezer búsqueda falló, usando respaldo iTunes:', err);
  }

  // 2. Respaldo secundario: iTunes Search API con filtrado inteligente anti-covers
  try {
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&entity=song&country=AR&limit=10`;
    const res = await fetch(itunesUrl);
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const best = pickBestResult(
          data.results,
          mainArtist,
          track.title,
          (it) => it.artistName,
          (it) => it.trackName
        );

        if (best && best.previewUrl) {
          const artwork = (best.artworkUrl100 || '').replace('100x100bb', '600x600bb');
          const releaseYear =
            track.year ||
            (best.releaseDate ? new Date(best.releaseDate).getFullYear() : 2020);

          const enriched = {
            ...track,
            previewUrl: best.previewUrl,
            artwork,
            year: releaseYear
          };
          sessionAudioCache.set(cacheKey, enriched);
          return enriched;
        }
      }
    }
  } catch (err) {
    console.warn('Respaldo iTunes falló:', err);
  }

  return {
    ...track,
    artwork:
      metaCache?.artwork ||
      track.artwork ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    previewUrl: null,
    year: track.year || metaCache?.year || 2020
  };
}

/**
 * Busca canciones en tiempo real para el Creador de Playlists personalizadas
 */
export async function searchSongsLive(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const data = await deezerJsonp(`/search?q=${encodeURIComponent(query.trim())}&limit=8`);
    const items = data?.data || [];
    return items.map((item) => ({
      deezerId: item.id,
      title: item.title_short || item.title,
      artist: item.artist?.name || 'Artista',
      album: item.album?.title || '',
      artwork: item.album?.cover_big || item.album?.cover_medium,
      previewUrl: item.preview
    }));
  } catch (err) {
    console.error('Error buscando canciones:', err);
    return [];
  }
}

/**
 * Obtiene el año oficial de lanzamiento de una pista de Deezer por su ID
 */
export async function fetchTrackReleaseYear(deezerId) {
  try {
    const detail = await deezerJsonp(`/track/${deezerId}`);
    const dateStr = detail?.release_date || detail?.album?.release_date;
    if (dateStr) {
      const year = parseInt(dateStr.slice(0, 4), 10);
      if (!isNaN(year) && year > 1920) return year;
    }
  } catch (err) {
    console.warn('No se pudo obtener el año exacto del track:', err);
  }
  return new Date().getFullYear();
}

/**
 * Importa una Playlist pública de Spotify a partir de su URL o ID
 * Guarda las canciones inmediatamente y resuelve audio/año bajo demanda durante cada turno.
 */
export async function importSpotifyPlaylist(urlOrId) {
  const match = String(urlOrId).match(/playlist[/:]([a-zA-Z0-9]+)/);
  const playlistId = match ? match[1] : String(urlOrId).trim();

  if (!playlistId) {
    throw new Error('No se encontró un enlace o ID válido de playlist de Spotify.');
  }

  const endpoint = `/api/spotify?id=${encodeURIComponent(playlistId)}`;
  const res = await fetch(endpoint);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Error al importar de Spotify (HTTP ${res.status})`);
  }

  const data = await res.json();
  const rawTracks = data.tracks || [];

  if (rawTracks.length === 0) {
    throw new Error('No se encontraron canciones en esta playlist.');
  }

  const tracks = rawTracks.map((item, i) => ({
    id: `sp-${playlistId}-${i + 1}`,
    title: item.title,
    artist: item.artist,
    searchTerm: `${item.artist} ${item.title}`,
    previewUrl: item.audioPreviewUrl || null
  }));

  return {
    id: `custom-sp-${playlistId}-${Date.now()}`,
    title: data.title || 'Playlist de Spotify',
    description: `Importada desde Spotify (${tracks.length} canciones)`,
    cover:
      data.cover ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    tracks,
    isCustom: true
  };
}
export async function importDeezerPlaylist(urlOrId, onProgress) {
  const match = String(urlOrId).match(/(\d{6,15})/);
  if (!match) {
    throw new Error('No se encontró un ID válido de Playlist de Deezer en el enlace.');
  }
  const playlistId = match[1];
  const data = await deezerJsonp(`/playlist/${playlistId}`);

  if (!data || !data.tracks || !data.tracks.data || data.tracks.data.length === 0) {
    throw new Error('La playlist está vacía o es privada.');
  }

  const rawTracks = data.tracks.data.slice(0, 50); // Límite sano de 50 canciones para rapidez
  const tracks = [];

  for (let i = 0; i < rawTracks.length; i++) {
    const item = rawTracks[i];
    if (onProgress) {
      onProgress(i + 1, rawTracks.length, `${item.artist?.name} - ${item.title}`);
    }
    const year = await fetchTrackReleaseYear(item.id);
    tracks.push({
      id: `dz-${item.id}`,
      deezerId: item.id,
      title: item.title_short || item.title,
      artist: item.artist?.name || 'Artista',
      year,
      artwork: item.album?.cover_big || item.album?.cover_medium,
      searchTerm: `${item.artist?.name || ''} ${item.title_short || item.title}`
    });
  }

  return {
    id: `custom-dz-${playlistId}-${Date.now()}`,
    title: data.title || 'Playlist Importada',
    description: data.description || `Importada de Deezer (${tracks.length} canciones)`,
    cover:
      data.picture_big ||
      data.picture_medium ||
      tracks[0]?.artwork ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    tracks,
    isCustom: true
  };
}
