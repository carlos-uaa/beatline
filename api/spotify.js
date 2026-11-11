// api/spotify.js - Endpoint optimizado de extracción completa de Spotify (GraphQL Pathfinder + Embed Fallback)
// Soporta playlists de 100 hasta más de 1,000 canciones sin requerir login interactivo ni redirecciones OAuth.

const PATHFINDER_URL = 'https://api-partner.spotify.com/pathfinder/v1/query';
const PLAYLIST_SHA256 = 'a65e12194ed5fc443a1cdebed5fabe33ca5b07b987185d63c72483867ad13cb4';
const OPERATION_NAME = 'fetchPlaylist';

async function getEmbedSessionAndFallback(playlistId) {
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const response = await fetch(embedUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-MX,es;q=0.9,en;q=0.8'
    }
  });

  if (!response.ok) {
    throw new Error(`Spotify embed HTTP ${response.status}`);
  }

  const html = await response.text();
  const idx = html.indexOf('__NEXT_DATA__');
  if (idx === -1) {
    throw new Error('No se encontraron metadatos públicos de la playlist de Spotify.');
  }

  const start = html.indexOf('>', idx) + 1;
  const end = html.indexOf('</script>', start);
  const nextData = JSON.parse(html.slice(start, end));

  const session = nextData?.props?.pageProps?.state?.settings?.session;
  const entity = nextData?.props?.pageProps?.state?.data?.entity;
  const trackList = entity?.trackList || [];

  const fallbackTracks = trackList.map((t) => ({
    id: t.uri || `sp-${Math.random()}`,
    title: t.title,
    artist: t.subtitle,
    searchTerm: `${t.subtitle} ${t.title}`,
    audioPreviewUrl: t.audioPreview?.url || null,
    year: null
  }));

  return {
    token: session?.accessToken || null,
    title: entity?.title || 'Playlist de Spotify',
    subtitle: entity?.subtitle || 'Spotify',
    cover: entity?.coverArt?.sources?.[0]?.url || null,
    fallbackTracks
  };
}

async function fetchPathfinderPage(playlistId, token, offset, limit = 100) {
  const variables = {
    uri: `spotify:playlist:${playlistId}`,
    offset,
    limit,
    enableWatchFeedEntrypoint: false
  };
  const extensions = {
    persistedQuery: {
      version: 1,
      sha256Hash: PLAYLIST_SHA256
    }
  };

  const url = `${PATHFINDER_URL}?operationName=${OPERATION_NAME}&variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}&extensions=${encodeURIComponent(JSON.stringify(extensions))}`;

  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'app-platform': 'WebPlayer'
    }
  });

  if (!res.ok) {
    console.warn(`Pathfinder query failed at offset ${offset}: HTTP ${res.status}`);
    return null;
  }

  return await res.json();
}

function parsePathfinderItem(it) {
  const t = it?.itemV2?.data;
  if (!t || !t.name) return null;

  const artists =
    t.artists?.items?.map((a) => a.profile?.name).filter(Boolean).join(', ') || 'Desconocido';

  let year = null;
  const isoDate =
    it?.itemV3?.data?.identityTrait?.contentHierarchyParent?.publishingMetadataTrait?.firstPublishedAt?.isoString ||
    t.albumOfTrack?.date?.isoString;

  if (isoDate) {
    const parsedYear = parseInt(isoDate.slice(0, 4), 10);
    if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= 2030) {
      year = parsedYear;
    }
  }

  return {
    id: t.uri ? `sp-${t.uri.split(':').pop()}` : `sp-${Math.random()}`,
    title: t.name,
    artist: artists,
    searchTerm: `${artists} ${t.name}`,
    audioPreviewUrl: null,
    year
  };
}

async function fetchPathfinderTracks(playlistId, token) {
  const limit = 100;
  const maxTracks = 1500; // Margen para playlists de hasta 1500 canciones

  // 1. Obtener primera página y total de canciones
  const page0 = await fetchPathfinderPage(playlistId, token, 0, limit);
  if (!page0) {
    return { totalCount: 0, tracks: [] };
  }

  const plData = page0?.data?.playlistV2;
  const totalCount = typeof plData?.content?.totalCount === 'number' ? plData.content.totalCount : 100;
  const items0 = plData?.content?.items || [];
  let allItems = [...items0];

  // 2. Si hay más páginas, descargarlas en paralelo para responder en ~3 segundos
  if (totalCount > limit) {
    const offsets = [];
    for (let off = limit; off < totalCount && off < maxTracks; off += limit) {
      offsets.push(off);
    }

    try {
      const remainingPages = await Promise.all(
        offsets.map((off) => fetchPathfinderPage(playlistId, token, off, limit))
      );
      for (const p of remainingPages) {
        const extraItems = p?.data?.playlistV2?.content?.items || [];
        allItems = allItems.concat(extraItems);
      }
    } catch (e) {
      console.warn('Error en paginación paralela de Pathfinder:', e);
    }
  }

  const tracks = allItems.map(parsePathfinderItem).filter(Boolean);

  return {
    totalCount,
    tracks
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, id, token: queryToken } = req.query;
  const bearerToken = req.headers?.authorization?.replace(/^Bearer\s+/i, '');
  const input = url || id || '';
  const match = String(input).match(/playlist[/:]([a-zA-Z0-9]+)/);
  const playlistId = match ? match[1] : input.trim();

  if (!playlistId || playlistId.length < 5) {
    return res.status(400).json({ error: 'No se detectó un ID o enlace válido de playlist de Spotify.' });
  }

  try {
    // 1. Obtener la sesión y metadatos base
    const baseInfo = await getEmbedSessionAndFallback(playlistId);
    const activeToken = baseInfo.token || queryToken || bearerToken;

    // 2. Si hay token de sesión del Web Player o del usuario, ejecutar paginación GraphQL de hasta 1500 canciones
    if (activeToken) {
      try {
        const pathfinderResult = await fetchPathfinderTracks(playlistId, activeToken);
        if (pathfinderResult.tracks && pathfinderResult.tracks.length > 0) {
          return res.status(200).json({
            id: playlistId,
            title: baseInfo.title,
            subtitle: baseInfo.subtitle,
            cover: baseInfo.cover,
            totalCount: pathfinderResult.totalCount,
            totalFetched: pathfinderResult.tracks.length,
            tracks: pathfinderResult.tracks
          });
        }
      } catch (gqlErr) {
        console.warn('Pathfinder GraphQL pagination falló, recurriendo a fallback embed:', gqlErr.message);
      }
    }

    // 3. Fallback de respaldo: Primeras 100 canciones del embed
    return res.status(200).json({
      id: playlistId,
      title: baseInfo.title,
      subtitle: baseInfo.subtitle,
      cover: baseInfo.cover,
      totalCount: baseInfo.fallbackTracks.length,
      totalFetched: baseInfo.fallbackTracks.length,
      tracks: baseInfo.fallbackTracks
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Error al conectar con Spotify.'
    });
  }
}
