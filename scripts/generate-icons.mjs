import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";

const SOURCE = "Paws Connect.png";
await mkdir("public/icons", { recursive: true });

// The source is a square: the emblem sits in the upper middle and the wordmark below it.
// Crop box is expressed as fractions of a 1024px reference so any source resolution works.
const { width: srcSize } = await sharp(SOURCE).metadata();
const scale = srcSize / 1024;
const EMBLEM = {
  left: Math.round(255 * scale),
  top: Math.round(190 * scale),
  width: Math.round(515 * scale),
  height: Math.round(515 * scale),
};

const PNG = { compressionLevel: 9, palette: true, quality: 90 };

await sharp(SOURCE).resize(640).png(PNG).toFile("public/logo.png");

const emblem = await sharp(SOURCE).extract(EMBLEM).png().toBuffer();
await sharp(emblem).resize(256).png(PNG).toFile("public/logo-mark.png");

async function iconBuffer(size, padding, png = PNG) {
  const inner = Math.round(size * (1 - padding * 2));
  const art = await sharp(emblem).resize(inner, inner).png().toBuffer();
  return sharp({
    create: { width: size, height: size, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: art, gravity: "center" }])
    .ensureAlpha()
    .png(png)
    .toBuffer();
}

async function icon(size, padding, file) {
  await writeFile(file, await iconBuffer(size, padding));
}

// ICO files may embed PNG images directly; browsers request /favicon.ico regardless of <link rel="icon">.
// Next.js only decodes RGBA PNGs inside ICOs, so these skip palette quantization.
async function favicon(sizes, file) {
  const images = await Promise.all(sizes.map((s) => iconBuffer(s, 0.02, { compressionLevel: 9 })));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((img, i) => {
    const e = 6 + i * 16;
    header.writeUInt8(sizes[i] % 256, e);
    header.writeUInt8(sizes[i] % 256, e + 1);
    header.writeUInt16LE(1, e + 4);
    header.writeUInt16LE(32, e + 6);
    header.writeUInt32LE(img.length, e + 8);
    header.writeUInt32LE(offset, e + 12);
    offset += img.length;
  });
  await writeFile(file, Buffer.concat([header, ...images]));
}

await icon(192, 0.04, "public/icons/icon-192.png");
await icon(512, 0.04, "public/icons/icon-512.png");
await icon(512, 0.14, "public/icons/maskable-512.png");
await icon(180, 0.06, "public/icons/apple-touch-icon.png");
await icon(512, 0.02, "app/icon.png");
await favicon([16, 32, 48], "app/favicon.ico");

console.log("Icons generated.");
