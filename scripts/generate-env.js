/**
 * .env veya Vercel Environment Variables → js/runtime-config.js
 * Tarayıcı .env okuyamaz; build/deploy sırasında bu dosya üretilir.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function loadEnvFile(envPath) {
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, 'utf8');
    for (let line of text.split('\n')) {
        const s = line.trim();
        if (!s || s.startsWith('#')) continue;
        const eq = s.indexOf('=');
        if (eq === -1) continue;
        const k = s.slice(0, eq).trim();
        let v = s.slice(eq + 1).trim();
        if (!k) continue;
        if (
            (v.startsWith('"') && v.endsWith('"')) ||
            (v.startsWith("'") && v.endsWith("'"))
        ) {
            v = v.slice(1, -1);
        }
        if (process.env[k] === undefined) {
            process.env[k] = v;
        }
    }
}

loadEnvFile(path.join(root, '.env'));

const SUPABASE_URL = (process.env.SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (process.env.SUPABASE_ANON_KEY || '').trim();
const GOOGLE_MAPS_API_KEY = (process.env.GOOGLE_MAPS_API_KEY || '').trim();
const SITE_URL = (process.env.SITE_URL || '').trim().replace(/\/$/, '');

const outDir = path.join(root, 'js');
const outFile = path.join(outDir, 'runtime-config.js');

const payload = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    GOOGLE_MAPS_API_KEY,
    SITE_URL
};

const json = JSON.stringify(payload);
const content =
    '/** Otomatik üretildi — .env veya Vercel Environment Variables. Git’e eklenmez. */\n' +
    '(function(){\n' +
    'var c=' +
    json +
    ';\n' +
    'window.__DEVRETIN_ENV__=c;\n' +
    'window.GOOGLE_MAPS_API_KEY=c.GOOGLE_MAPS_API_KEY||"";\n' +
    '})();\n';

if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(outFile, content, 'utf8');

const missing = [];
if (!SUPABASE_URL) missing.push('SUPABASE_URL');
if (!SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');
if (!GOOGLE_MAPS_API_KEY) missing.push('GOOGLE_MAPS_API_KEY');

if (missing.length) {
    console.warn(
        '[generate-env] Eksik ortam değişkenleri: ' +
            missing.join(', ') +
            '. Yerelde .env doldur; Vercel’de Environment Variables.'
    );
} else {
    console.log('[generate-env] js/runtime-config.js yazıldı (tam).');
}

const sm = (process.env.SITE_MAINTENANCE || '').trim();
if (sm === '1' || sm === 'true' || sm === 'yes') {
    console.log(
        '[generate-env] SITE_MAINTENANCE açık — Vercel middleware tüm sayfaları maintenance.html’e yönlendirir.'
    );
}
