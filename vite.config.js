import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Middleware local para simular la función serverless de Vercel (/api/spotify) en desarrollo
function spotifyDevMiddleware() {
  return {
    name: 'spotify-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/spotify', async (req, res) => {
        const urlObj = new URL(req.url, 'http://localhost');
        const input = urlObj.searchParams.get('url') || urlObj.searchParams.get('id') || '';
        const match = String(input).match(/playlist[/:]([a-zA-Z0-9]+)/);
        const playlistId = match ? match[1] : input.trim();

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');

        if (!playlistId) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'No se detectó un ID válido de Spotify' }));
        }

        try {
          const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
          const response = await fetch(embedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          const html = await response.text();
          const scriptMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.+?)<\/script>/);
          if (!scriptMatch) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'No se pudo leer la playlist pública.' }));
          }
          const nextData = JSON.parse(scriptMatch[1]);
          const entity = nextData?.props?.pageProps?.state?.data?.entity;
          const trackList = entity?.trackList || [];

          res.statusCode = 200;
          return res.end(JSON.stringify({
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
          }));
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    spotifyDevMiddleware()
  ],
})
