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
export const USER_CORRECTIONS_KEY = 'beatline_user_corrections_v1';

// Años canónicos verificados para canciones con metadatos notoriamente erróneos en distribuidoras digitales
export const CANONICAL_TRACK_YEARS = {
  'lp - lost on you': 2016,
  'lp - other people': 2016,
  'lp - tightrope': 2016,
  'lp - when were high': 2017,
  'lp - shaken': 2018,
  'cuisillos de arturo macias - ya no me mires asi': 1998,
  'cuisillos - ya no me mires asi': 1998,
  'lefty sm - por mi mexico remix': 2023,
  'lefty sm - por mi mexico': 2020
};

export function getCanonicalYear(artist, title) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const art = norm(artist);
  const tit = norm(title);
  const key = `${art} - ${tit}`;
  if (CANONICAL_TRACK_YEARS[key]) return CANONICAL_TRACK_YEARS[key];

  const mainArtist = art.split(' y ')[0].split(' con ')[0].split(' de ')[0].split(' feat ')[0].trim();
  const mainKey = `${mainArtist} - ${tit}`;
  if (CANONICAL_TRACK_YEARS[mainKey]) return CANONICAL_TRACK_YEARS[mainKey];

  return null;
}

export function getUserCorrections() {
  try {
    const raw = localStorage.getItem(USER_CORRECTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveUserTrackCorrection(artist, title, data) {
  try {
    const key = `${artist} - ${title}`.toLowerCase().trim();
    const all = getUserCorrections();
    all[key] = {
      year: Number(data.year),
      artist: data.artist || artist,
      title: data.title || title,
      updatedAt: Date.now()
    };
    localStorage.setItem(USER_CORRECTIONS_KEY, JSON.stringify(all));

    // Guardar también en la caché persistente de metadatos
    saveMetadataCache(key, {
      year: Number(data.year)
    });

    // Actualizar en la caché en memoria de la sesión
    if (sessionAudioCache.has(key)) {
      const prev = sessionAudioCache.get(key);
      sessionAudioCache.set(key, {
        ...prev,
        year: Number(data.year),
        artist: data.artist || prev.artist,
        title: data.title || prev.title,
        resolvedArtist: data.artist || prev.resolvedArtist,
        resolvedTitle: data.title || prev.resolvedTitle
      });
    }
  } catch (e) {
    console.error('Error saving user track correction:', e);
  }
}

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

const STOP_WORDS = new Set([
  'los', 'las', 'el', 'la', 'lo', 'the', 'de', 'del', 'y', 'and', 'grupo', 'banda', 'conjunto', 'orchestra', 'orquesta'
]);

/**
 * Puntúa resultados para garantizar la coincidencia exacta de Artista, Versión (Original vs Remix)
 * y descarta "Type Beats", "Karaoke", "Cumbia Cover", "Tribute", "En Vivo", etc.
 */
function pickBestResult(items, expectedArtist, expectedTitle, getArtist, getTitle, expectedYear = null, getReleaseYear = null) {
  if (!items || items.length === 0) return null;

  const normExpectedArtist = normalizeStr(expectedArtist);
  const artistTokens = normExpectedArtist.split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  const primarySignificantArtist = artistTokens[0] || normExpectedArtist;

  const normExpectedTitle = normalizeStr(expectedTitle);
  const titleWords = normExpectedTitle.split(/\s+/).filter((w) => w.length > 2);

  const expectRemix = /\b(remix|rmx)\b/i.test(normExpectedTitle);
  const expectLive = /\b(en vivo|live|acustico|acoustic)\b/i.test(normExpectedTitle);

  const forbiddenTerms = [
    'type beat',
    'karaoke',
    'tribute',
    'instrumental',
    'cover',
    '8d',
    'sped up',
    'slowed',
    'parody',
    'pablillo',
    'vallorani'
  ];

  let bestItem = null;
  let bestScore = -9999;

  for (const item of items) {
    const rawArtist = getArtist(item) || '';
    const rawTitle = getTitle(item) || '';
    const artist = normalizeStr(rawArtist);
    const title = normalizeStr(rawTitle);
    let score = 0;

    // 1. Coincidencia de Artista
    if (artist === normExpectedArtist) {
      score += 100;
    } else if (artist.includes(normExpectedArtist) || normExpectedArtist.includes(artist)) {
      score += 70;
    } else if (artist.includes(primarySignificantArtist)) {
      score += 50;
    } else {
      score -= 200;
    }

    // 2. Coincidencia de Título
    if (title === normExpectedTitle) {
      score += 80;
    } else if (title.includes(normExpectedTitle) || normExpectedTitle.includes(title)) {
      score += 45;
    } else {
      let matchedWords = 0;
      for (const w of titleWords) {
        if (title.includes(w)) matchedWords++;
      }
      if (titleWords.length > 0 && matchedWords === titleWords.length) {
        score += 40;
      } else {
        score += matchedWords * 10;
      }
    }

    // 3. Fidelidad estricta de Versión (Remix vs Original)
    const itemHasRemix = /\b(remix|rmx)\b/i.test(title);
    if (expectRemix) {
      if (itemHasRemix) score += 90;
      else score -= 250; // Buscamos remix, no original
    } else {
      if (itemHasRemix) score -= 250; // Buscamos original, no remix
    }

    // 4. Fidelidad de En Vivo / Acústico
    const itemHasLive = /\b(en vivo|live|acustico|acoustic)\b/i.test(title);
    if (expectLive) {
      if (itemHasLive) score += 60;
      else score -= 150;
    } else {
      if (itemHasLive) score -= 150;
    }

    // 5. Penalizar términos no deseados (covers, karaokes, instrumentales)
    for (const bad of forbiddenTerms) {
      if (!normExpectedTitle.includes(bad) && (title.includes(bad) || artist.includes(bad))) {
        score -= 300;
      }
    }

    // 6. Coincidencia de Año de Lanzamiento (evita recopilatorios de 2026 para canciones de los 90s)
    if (expectedYear && getReleaseYear) {
      const itemYear = getReleaseYear(item);
      if (itemYear) {
        const diff = Math.abs(itemYear - expectedYear);
        if (diff === 0) {
          score += 60;
        } else if (diff <= 1) {
          score += 35;
        } else if (diff >= 8) {
          score -= 100;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem || items[0];
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
  const userCorrections = getUserCorrections();
  const userOverride = userCorrections[cacheKey];

  if (sessionAudioCache.has(cacheKey)) {
    const cached = sessionAudioCache.get(cacheKey);
    if (userOverride) {
      return {
        ...cached,
        year: Number(userOverride.year) || cached.year,
        artist: userOverride.artist || cached.artist,
        title: userOverride.title || cached.title,
        resolvedArtist: userOverride.artist || cached.resolvedArtist,
        resolvedTitle: userOverride.title || cached.resolvedTitle
      };
    }
    return cached;
  }

  const metaCache = getMetadataCache()[cacheKey];
  const canonicalYear = getCanonicalYear(track.artist, track.title);
  if (canonicalYear && metaCache && metaCache.year !== canonicalYear) {
    saveMetadataCache(cacheKey, {
      artwork: metaCache.artwork,
      year: canonicalYear
    });
  }

  const mainArtist = (track.artist || '').split('&')[0].split(',')[0].trim();
  const cleanQuery = `${mainArtist} ${track.title}`;
  const targetYear = userOverride?.year || canonicalYear || track.year;

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
        (it) => it.title,
        targetYear,
        (it) => (it.album?.release_date ? parseInt(it.album.release_date.slice(0, 4), 10) : null)
      );

      if (best && best.preview) {
        let releaseYear = targetYear || metaCache?.year;

        // Si es una canción de una playlist personalizada sin año fijo, consultamos el detalle del track en Deezer y contrastamos con iTunes
        if (!releaseYear) {
          let deezerYear = null;
          if (best.id) {
            try {
              const detail = await deezerJsonp(`/track/${best.id}`);
              const dateStr = detail?.release_date || detail?.album?.release_date;
              if (dateStr) {
                const parsedYear = parseInt(dateStr.slice(0, 4), 10);
                if (!isNaN(parsedYear) && parsedYear > 1920) {
                  deezerYear = parsedYear;
                }
              }
            } catch {}
          }

          // Consultar iTunes en paralelo para contrastar contra reediciones o regrabaciones modernas
          let itunesYear = null;
          try {
            const cleanArtist = mainArtist
              .replace(/\bde [A-Z][a-z]+ [A-Z][a-z]+\b/i, '')
              .replace(/\bde [A-Z][a-z]+\b/i, '')
              .trim();
            const itQuery = `${cleanArtist || mainArtist} ${track.title}`.trim();

            const itRes = await fetch(
              `https://itunes.apple.com/search?term=${encodeURIComponent(itQuery)}&entity=song&limit=15`
            );
            if (itRes.ok) {
              const itData = await itRes.json();
              const matchingYears = [];
              const norm = (s) =>
                String(s || '')
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9]/g, '');

              const stripDecorations = (str) =>
                String(str || '')
                  .replace(/\([^)]*(?:remix|en vivo|live|version|edit|ft|feat)[^)]*\)/gi, '')
                  .replace(/\[[^\]]*(?:remix|en vivo|live|version|edit|ft|feat)[^\]]*\]/gi, '')
                  .replace(/- (?:remix|en vivo|live|remasterizada|remastered).*/gi, '')
                  .trim();

              const cleanArtistNorm = norm(cleanArtist || mainArtist).replace(/\bde[a-z]+/g, '');
              const targetTitleNorm = norm(track.title);
              const targetTitleStripped = norm(stripDecorations(track.title));

              for (const it of itData.results || []) {
                const itArtistNorm = norm(it.artistName || '').replace(/\bde[a-z]+/g, '');
                // 1. El artista debe coincidir obligatoriamente (evita falsos positivos como otra canción con nombre parecido)
                const artistMatches =
                  cleanArtistNorm &&
                  (itArtistNorm.includes(cleanArtistNorm) || cleanArtistNorm.includes(itArtistNorm));

                if (!artistMatches) continue;

                // 2. El título debe coincidir de forma estricta (completo o sin etiquetas de remix/en vivo)
                const itTitleNorm = norm(it.trackName || '');
                const itTitleStripped = norm(stripDecorations(it.trackName || ''));

                const titleMatches =
                  itTitleNorm === targetTitleNorm ||
                  (targetTitleStripped && itTitleStripped === targetTitleStripped);

                if (titleMatches) {
                  const y = parseInt(it.releaseDate?.slice(0, 4), 10);
                  if (!isNaN(y) && y > 1920 && y <= new Date().getFullYear()) {
                    matchingYears.push(y);
                  }
                }
              }

              if (matchingYears.length > 0) {
                // El año más antiguo entre las versiones de estudio encontradas es el original
                itunesYear = Math.min(...matchingYears);
              }
            }
          } catch {}

          // Si Deezer y iTunes arrojan años válidos:
          if (deezerYear && itunesYear) {
            // Si la fecha de Deezer es del año 2000 en adelante (canción contemporánea) y iTunes arroja
            // una fecha con más de 3 años de antigüedad hacia el pasado (ej. errores de distribuidor en Apple Music
            // como LP 2009 vs 2016, o falso positivo con un tema homónimo viejo), confiamos en la fecha oficial de Deezer:
            if (deezerYear >= 2000 && deezerYear - itunesYear >= 4) {
              releaseYear = deezerYear;
            } else {
              releaseYear = Math.min(deezerYear, itunesYear);
            }
          } else {
            releaseYear = itunesYear || deezerYear || 2020;
          }
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
          resolvedArtist: userOverride?.artist || best.artist?.name || track.artist,
          resolvedTitle: userOverride?.title || best.title || track.title
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
          (it) => it.trackName,
          targetYear,
          (it) => (it.releaseDate ? parseInt(it.releaseDate.slice(0, 4), 10) : null)
        );

        if (best && best.previewUrl) {
          const artwork = (best.artworkUrl100 || '').replace('100x100bb', '600x600bb');
          const releaseYear =
            targetYear ||
            (best.releaseDate ? new Date(best.releaseDate).getFullYear() : 2020);

          const enriched = {
            ...track,
            previewUrl: best.previewUrl,
            artwork,
            year: releaseYear,
            resolvedArtist: userOverride?.artist || best.artistName || track.artist,
            resolvedTitle: userOverride?.title || best.trackName || track.title
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
    year: userOverride?.year || canonicalYear || track.year || metaCache?.year || 2020,
    artist: userOverride?.artist || track.artist,
    title: userOverride?.title || track.title
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
export async function importSpotifyPlaylist(urlOrId, userToken = null) {
  const match = String(urlOrId).match(/playlist[/:]([a-zA-Z0-9]+)/);
  const playlistId = match ? match[1] : String(urlOrId).trim();

  if (!playlistId) {
    throw new Error('No se encontró un enlace o ID válido de playlist de Spotify.');
  }

  let endpoint = `/api/spotify?id=${encodeURIComponent(playlistId)}`;
  if (userToken) {
    endpoint += `&token=${encodeURIComponent(userToken)}`;
  }
  const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};

  const res = await fetch(endpoint, { headers });
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
    previewUrl: item.audioPreviewUrl || null,
    year: item.year || null
  }));

  return {
    id: `custom-sp-${playlistId}-${Date.now()}`,
    title: data.title || 'Playlist de Spotify',
    description: `Importada desde Spotify (${tracks.length} canciones)`,
    cover:
      data.cover ||
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    tracks,
    spotifyPlaylistId: playlistId,
    spotifyUrl: `https://open.spotify.com/playlist/${playlistId}`,
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
