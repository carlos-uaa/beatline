export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, id } = req.query;
  const input = url || id || '';
  const match = String(input).match(/playlist[/:]([a-zA-Z0-9]+)/);
  const playlistId = match ? match[1] : input.trim();

  if (!playlistId || playlistId.length < 5) {
    return res.status(400).json({ error: 'No se detectó un ID o enlace válido de playlist de Spotify.' });
  }

  try {
    const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
    const response = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
      return res.status(404).json({ error: 'No se pudieron extraer canciones. Verifica que la playlist sea pública.' });
    }

    const nextData = JSON.parse(scriptMatch[1]);
    const entity = nextData?.props?.pageProps?.state?.data?.entity;
    const trackList = entity?.trackList || [];

    if (trackList.length === 0) {
      return res.status(404).json({ error: 'La playlist está vacía o no tiene canciones públicas.' });
    }

    return res.status(200).json({
      id: playlistId,
      title: entity?.title || 'Playlist de Spotify',
      subtitle: entity?.subtitle || 'Spotify',
      cover: entity?.coverArt?.sources?.[0]?.url || null,
      tracks: trackList.map((t) => ({
        id: t.uri || `sp-${Math.random()}`,
        title: t.title,
        artist: t.subtitle,
        audioPreviewUrl: t.audioPreview?.url || null
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Error al conectar con Spotify.' });
  }
}
