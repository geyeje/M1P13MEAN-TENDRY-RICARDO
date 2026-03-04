// scripts/set-env.js
// Writes src/environments/environment.prod.ts from environment variables at build time.
const fs = require('fs');
const path = require('path');

const outPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');

let API_URL =
  process.env.API_URL ||
  process.env.NGX_API_URL ||
  'https://m1p13mean-tendry-ricardo.onrender.com/api';

// Suppression du slash final s'il existe
if (API_URL.endsWith('/')) {
  API_URL = API_URL.slice(0, -1);
}
const STRIPE_KEY = process.env.STRIPE_PUBLIC_KEY || process.env.STRIPE_PK || '';

const content = `export const environment = {
  production: true,
  apiUrl: '${API_URL}',
  stripePublicKey: '${STRIPE_KEY}'
};
`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, { encoding: 'utf8' });
console.log('[set-env] Wrote', outPath);
