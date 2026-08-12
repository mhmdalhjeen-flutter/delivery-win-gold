/**
 * Regenerates PWA icons from the delivery logo PNG.
 * Run: npm run generate:brand
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const sourceLogo = path.join(root, 'public/brand/win-goldenstore-logo-deleviry.png');
const brandDir = path.join(root, 'public/brand');

const LOGO_SIZES = [64, 128, 192, 256, 384, 512];
const MASKABLE_SIZES = [192, 512];

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function resizeLogo(size, outPath, { maskable = false } = {}) {
  const canvas = sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: maskable ? '#1e3a8a' : { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  const inset = maskable ? Math.round(size * 0.12) : 0;
  const inner = size - inset * 2;

  const logo = await sharp(sourceLogo)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await canvas
    .composite([{ input: logo, gravity: 'centre' }])
    .webp({ quality: 90, effort: 6 })
    .toFile(outPath);
}

async function resizeLogoPng(size, outPath) {
  await sharp(sourceLogo)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outPath);
}

async function writeFavicon() {
  const pngBuffer = await sharp(sourceLogo)
    .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  await fs.writeFile(path.join(brandDir, 'favicon.ico'), pngBuffer);
}

async function main() {
  await ensureDir(brandDir);

  for (const size of LOGO_SIZES) {
    await resizeLogo(size, path.join(brandDir, `logo-${size}.webp`));
  }

  for (const size of MASKABLE_SIZES) {
    await resizeLogo(size, path.join(brandDir, `logo-${size}-maskable.webp`), { maskable: true });
  }

  await resizeLogoPng(64, path.join(brandDir, 'logo-64.png'));
  await writeFavicon();

  console.log('Delivery brand assets generated in public/brand/');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
