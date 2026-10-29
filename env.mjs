// Loads a local ".env" file (KEY=value per line) into process.env. Real environment variables win, so Render is unaffected.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
try {
  const f = path.join(path.dirname(fileURLToPath(import.meta.url)), '.env');
  for (const line of fs.readFileSync(f, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}
