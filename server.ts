import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface MapsGroundingBody {
  query?: string;
  city?: string;
  lat?: number;
  lng?: number;
}

app.post('/api/maps-grounding', async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      res.status(500).json({
        error: 'GEMINI_API_KEY belum dikonfigurasi pada server.',
      });
      return;
    }

    const body = (req.body || {}) as MapsGroundingBody;
    const rawQuery = (body.query || '').trim();
    const city = (body.city || 'Pontianak, Kalimantan Barat').trim();

    if (!rawQuery) {
      res.status(400).json({
        error: 'Mohon masukkan kata kunci pencarian lokasi.',
      });
      return;
    }

    const prompt = `Anda adalah asisten lokasi KalbarRent untuk wilayah ${city}, Kalimantan Barat, Indonesia. Jawab dalam Bahasa Indonesia yang ringkas, jelas, dan informatif berdasarkan data Google Maps terbaru. Sertakan nama tempat, area jalan/kecamatan, dan informasi relevan untuk pencarian berikut: "${rawQuery}".`;

    const hasCoords =
      typeof body.lat === 'number' &&
      typeof body.lng === 'number' &&
      Number.isFinite(body.lat) &&
      Number.isFinite(body.lng);

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        ...(hasCoords
          ? {
              toolConfig: {
                retrievalConfig: {
                  latLng: {
                    latitude: body.lat as number,
                    longitude: body.lng as number,
                  },
                },
              },
            }
          : {}),
      },
    });

    const candidate = response.candidates?.[0];
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks || [];

    const places = groundingChunks
      .filter((chunk) => chunk.maps && (chunk.maps.uri || chunk.maps.title))
      .map((chunk) => {
        const mapsData = chunk.maps!;
        const snippets =
          mapsData.placeAnswerSources?.reviewSnippets
            ?.map((s) => s.reviewId || '')
            .filter(Boolean) || [];

        return {
          title: mapsData.title || 'Lokasi di Google Maps',
          uri: mapsData.uri || '',
          placeId: mapsData.placeId || '',
          reviewSnippets: snippets,
        };
      });

    res.json({
      text: response.text || 'Tidak ada ringkasan lokasi yang tersedia.',
      places,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Gagal mengambil data Google Maps.';
    const statusCode =
      message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
        ? 429
        : 500;
    res.status(statusCode).json({ error: message });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`KalbarRent server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
