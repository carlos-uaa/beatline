// api/spotify.js - Endpoint seguro en servidor (Vercel Serverless Function)
// Protege las llaves privadas del usuario: nunca se exponen al cliente ni al repositorio.

let cachedAppToken = null;
let tokenExpiresAt = 0;

async function getAppAccessToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) return null;

  if (cachedAppToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedAppToken;
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!res.ok) return null;
    const data = await res.json();
    cachedAppToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
    return cachedAppToken;
  } catch {
    return null;
  }
}

async function fetchAllPlaylistTracks(playlistId, accessToken) {
  const limit = 100;
  let offset = 0;
  let total = Infinity;
  const allTracks = [];
  const maxTracks = 1000; // Límite seguro para evitar timeouts

  // Primero obtenemos los metadatos de la playlist
  let playlistMeta = { title: 'Playlist de Spotify', cover: null, total: 0 };
  try {
    const metaRes = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}?fields=name,images,tracks.total`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (metaRes.ok) {
      const meta = await metaRes.json();
      playlistMeta.title = meta.name || 'Playlist de Spotify';
      playlistMeta.cover = meta.images?.[0]?.url || null;
      if (typeof meta.tracks?.total === 'number') {
        total = meta.tracks.total;
        playlistMeta.total = total;
      }
    }
  } catch (e) {
    console.warn('No se pudieron obtener metadatos de la playlist:', e);
  }

  while (offset < total && allTracks.length < maxTracks) {
    let pageUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${offset}&limit=${limit}&fields=items(track(id,name,artists(name),preview_url,album(images,release_date))),total,next`;
    let res = await fetch(pageUrl, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      pageUrl = `https://api.spotify.com/v1/playlists/${playlistId}/items?offset=${offset}&limit=${limit}&fields=items(track(id,name,artists(name),preview_url,album(images,release_date))),total,next`;
      res = await fetch(pageUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
    }

    if (!res.ok) {
      console.warn(`Spotify tracks request failed at offset ${offset}: HTTP ${res.status}`);
      break;
    }

    const data = await res.json();
    if (typeof data.total === 'number') {
      total = data.total;
    }

    const items = data.items || [];
    if (items.length === 0) break;

    for (const item of items) {
      const t = item.track;
      if (!t || !t.name) continue;

      let year = null;
      if (t.album?.release_date) {
        const parsedYear = parseInt(t.album.release_date.slice(0, 4), 10);
        if (!isNaN(parsedYear) && parsedYear > 1900 && parsedYear <= 2030) {
          year = parsedYear;
        }
      }

      allTracks.push({
        id: t.id ? `sp-${t.id}` : `sp-${Math.random()}`,
        title: t.name,
        artist: t.artists?.map((a) => a.name).join(', ') || 'Desconocido',
        audioPreviewUrl: t.preview_url || null,
        year
      });
    }

    if (!data.next) break;
    offset += limit;
  }

  return {
    title: playlistMeta.title,
    cover: playlistMeta.cover,
    tracks: allTracks
  };
}

async function scrapeEmbedPlaylist(playlistId) {
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
  const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);

  if (!scriptMatch) {
    throw new Error('No se pudieron extraer canciones. Verifica que la playlist sea pública.');
  }

  const nextData = JSON.parse(scriptMatch[1]);
  const entity = nextData?.props?.pageProps?.state?.data?.entity;
  const trackList = entity?.trackList || [];

  if (trackList.length === 0) {
    throw new Error('La playlist está vacía o no tiene canciones públicas.');
  }

  return {
    title: entity?.title || 'Playlist de Spotify',
    subtitle: entity?.subtitle || 'Spotify',
    cover: entity?.coverArt?.sources?.[0]?.url || null,
    tracks: trackList.map((t) => ({
      id: t.uri || `sp-${Math.random()}`,
      title: t.title,
      artist: t.subtitle,
      audioPreviewUrl: t.audioPreview?.url || null,
      year: null
    }))
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
  const input = url || id || '';
  const match = String(input).match(/playlist[/:]([a-zA-Z0-9]+)/);
  const playlistId = match ? match[1] : input.trim();

  if (!playlistId || playlistId.length < 5) {
    return res.status(400).json({ error: 'No se detectó un ID o enlace válido de playlist de Spotify.' });
  }

  // Token de usuario opcional enviado desde el frontend (si el usuario hizo login con Spotify)
  const authHeader = req.headers.authorization || '';
  const userToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : (queryToken || null);

  // 1. Si hay token de usuario (o token del app disponible), intentar paginación completa oficial
  const effectiveToken = userToken || (await getAppAccessToken());

  if (effectiveToken) {
    try {
      const result = await fetchAllPlaylistTracks(playlistId, effectiveToken);
      if (result.tracks && result.tracks.length > 0) {
        return res.status(200).json({
          id: playlistId,
          title: result.title,
          cover: result.cover,
          totalFetched: result.tracks.length,
          tracks: result.tracks
        });
      }
    } catch (apiErr) {
      console.warn('API oficial falló o requiere autorización adicional, probando scraper:', apiErr.message);
    }
  }

  // 2. Método de respaldo automático: Scraper de embed público (hasta 100 canciones, sin login ni claves)
  try {
    const embedData = await scrapeEmbedPlaylist(playlistId);
    return res.status(200).json({
      id: playlistId,
      title: embedData.title,
      subtitle: embedData.subtitle,
      cover: embedData.cover,
      totalFetched: embedData.tracks.length,
      tracks: embedData.tracks
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message || 'Error al conectar con Spotify.'
    });
  }
}
