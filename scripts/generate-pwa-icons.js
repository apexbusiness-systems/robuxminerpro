// scripts/generate-pwa-icons.js
// Run: node scripts/generate-pwa-icons.js
// Requires: npm install -D sharp (add to devDependencies)
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(__dirname, '../public/app_icon.png');
const outDir = path.join(__dirname, '../public');

await sharp(source).resize(192, 192).toFile(path.join(outDir, 'icon-192.png'));
await sharp(source).resize(512, 512).toFile(path.join(outDir, 'icon-512.png'));
console.log('PWA icons generated: icon-192.png, icon-512.png');
