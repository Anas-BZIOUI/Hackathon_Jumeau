import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'public', 'data');
const distDir = path.join(root, 'dist');
const plansDir = path.join(root, 'plans');

const app = express();
app.use(cors());
app.use(express.json());

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, name), 'utf8'));
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'jumeau-ensiie' });
});

app.get('/api/bootstrap', (_req, res) => {
  try {
    res.json({
      rooms: readJson('rooms.json'),
      floors: readJson('floors.json'),
      links: readJson('links.json'),
      graph: readJson('graph.json'),
      tours: readJson('tours.json'),
      metro: readJson('metro.json'),
      synonyms: readJson('synonyms.json'),
      zones: readJson('zones.json'),
      resources: readJson('resources.json')
    });
  } catch (err) {
    res.status(500).json({ error: 'Data not built. Run npm run data.', detail: String(err.message) });
  }
});

app.use('/data', express.static(dataDir));

if (fs.existsSync(plansDir)) {
  app.use('/plans', express.static(plansDir, { fallthrough: false }));
}

if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

const port = Number(process.env.PORT || 5174);
const server = app.listen(port, () => {
  console.log(`Jumeau API on http://127.0.0.1:${port}`);
});
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} already in use — reusing the existing API. Client: http://localhost:5173/`);
    return;
  }
  console.error(err);
  process.exit(1);
});
