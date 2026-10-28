// Offline development utility. No code or image-processing dependency is shipped to the browser.
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const options = {};
for (let i = 2; i < process.argv.length; i += 2) options[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
if (!options.input || !options.output || !options.manifest) {
  throw new Error('Usage: node scripts/normalize-species-assets.mjs --input source-dir --output output-dir --manifest docs/species-asset-processing.json [--tools .verify]');
}
const sharp = createRequire(path.resolve(options.tools || '.verify', 'package.json'))('sharp');
const manifest = JSON.parse(await fs.readFile(options.manifest, 'utf8'));
await fs.mkdir(options.output, { recursive: true });

// Retain the largest connected foreground, then fill enclosed light areas. This
// removes paper speckles without painting or generating any part of an animal.
function isolate(data, width, height, key) {
  const count = width * height;
  const foreground = new Uint8Array(count);
  for (let n = 0; n < count; n++) {
    const i = n * 4;
    const [r, g, b] = data.subarray(i, i + 3);
    const row = Math.floor(n / width);
    const sample = (row * width + 4) * 4;
    const background = key === 'green' ? Math.abs(r - 97) + Math.abs(g - 136) + Math.abs(b - 121) < 75
      : key === 'black' ? Math.max(r, g, b) < 40
      : key === 'paper' ? Math.abs(r - data[sample]) + Math.abs(g - data[sample + 1]) + Math.abs(b - data[sample + 2]) < 80
      : key === 'ink' ? (r + g + b) / 3 > 135
      : Math.min(r, g, b) > key;
    foreground[n] = data[i + 3] > 8 && !background ? 1 : 0;
  }
  if (key === 'ink') {
    for (let n = 0; n < count; n++) if (!foreground[n]) data[n * 4 + 3] = 0;
    return;
  }
  const visited = new Uint8Array(count);
  let largest = [];
  const queue = new Int32Array(count);
  for (let n = 0; n < count; n++) {
    if (!foreground[n] || visited[n]) continue;
    let head = 0, tail = 1;
    queue[0] = n; visited[n] = 1;
    while (head < tail) {
      const q = queue[head++], x = q % width;
      for (const v of [x ? q - 1 : -1, x < width - 1 ? q + 1 : -1, q - width, q + width]) {
        if (v >= 0 && v < count && foreground[v] && !visited[v]) { visited[v] = 1; queue[tail++] = v; }
      }
    }
    if (tail > largest.length) largest = Array.from(queue.subarray(0, tail));
  }
  const keep = new Uint8Array(count);
  largest.forEach(n => { keep[n] = 1; });
  // Flood the outside only; light eyes, bellies and fin interiors stay intact.
  visited.fill(0);
  let head = 0, tail = 0;
  function add(n) { if (n >= 0 && n < count && !keep[n] && !visited[n]) { visited[n] = 1; queue[tail++] = n; } }
  for (let x = 0; x < width; x++) { add(x); add((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { add(y * width); add(y * width + width - 1); }
  while (head < tail) {
    const q = queue[head++], x = q % width;
    if (x) add(q - 1);
    if (x < width - 1) add(q + 1);
    add(q - width); add(q + width);
  }
  for (let n = 0; n < count; n++) if (visited[n]) data[n * 4 + 3] = 0;
}

for (const item of manifest) {
  let pipeline = sharp(path.join(options.input, item.input), { density: 192 }).toColourspace('srgb').ensureAlpha().resize({ width: 1000 });
  let { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true });
  if (item.mask) {
    const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${info.width}" height="${info.height}" viewBox="0 0 1000 ${info.height}"><path d="${item.mask}" fill="white"/></svg>`);
    data = await sharp(data, { raw: info }).composite([{ input: mask, blend: 'dest-in' }]).raw().toBuffer();
  }
  if (item.key !== undefined) isolate(data, info.width, info.height, item.key);
  let left = info.width, top = info.height, right = -1, bottom = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 16) { left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y); }
  }
  if (right <= left || bottom <= top) throw new Error(`${item.speciesId}: no usable foreground`);
  let trimmed = await sharp(data, { raw: info }).extract({ left, top, width: right - left + 1, height: bottom - top + 1 }).png().toBuffer();
  if (item.rotate) trimmed = await sharp(trimmed).rotate(item.rotate, { background: '#00000000' }).png().toBuffer();
  // 412px maximum extent gives 50px (9.8%) safety margins. Fit never distorts.
  const contained = await sharp(trimmed).resize(412, 412, { fit: 'inside' }).png().toBuffer();
  const size = await sharp(contained).metadata();
  const output = path.join(options.output, `${item.speciesId}.webp`);
  let canvas = await sharp({ create: { width: 512, height: 512, channels: 4, background: '#00000000' } })
    .composite([{ input: contained, left: Math.floor((512 - size.width) / 2), top: Math.floor((512 - size.height) / 2) }])
    .raw().toBuffer();
  let radius = 0;
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    if (canvas[(y * 512 + x) * 4 + 3] > 16) radius = Math.max(radius, Math.hypot(x - 255.5, y - 255.5));
  }
  // A diagonal animal must also fit the circular frame, including its arm tips.
  if (radius > 206) {
    const side = Math.floor(512 * 206 / radius);
    const scaled = await sharp(canvas, { raw: { width: 512, height: 512, channels: 4 } }).resize(side, side).png().toBuffer();
    canvas = await sharp({ create: { width: 512, height: 512, channels: 4, background: '#00000000' } })
      .composite([{ input: scaled, left: Math.floor((512 - side) / 2), top: Math.floor((512 - side) / 2) }]).raw().toBuffer();
  }
  await sharp(canvas, { raw: { width: 512, height: 512, channels: 4 } }).toColourspace('srgb').webp({ lossless: true }).toFile(output);
  console.log(`${item.speciesId}: 512x512 transparent WebP`);
}
