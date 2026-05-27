#!/usr/bin/env node
// Genera los PNG de iconos PWA al tamaño correcto, con fondo oscuro y "ET" en blanco.
// No depende de sharp/canvas: construye los chunks PNG a mano (RGBA + zlib).
//
// Uso:  node tools/generate-icons.mjs
// Salida:  public/icon-192.png, public/icon-512.png, public/apple-touch-icon.png

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

// CRC-32 (PNG-spec, polinomio 0xEDB88320).
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c;
}
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

// Dibuja "ET" tipográfico simple en una matriz boolean: cada caracter en una rejilla 5x7.
const GLYPHS = {
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
};
function isInkAt(textCols, textRows, charScale, gapPx, x, y) {
  const totalWidth = textCols * 5 * charScale + gapPx;
  const totalHeight = textRows * 7 * charScale;
  const offsetX = Math.floor((x - 0) / 1) - 0;
  void offsetX;
  // x,y son coords dentro del área de texto; chequeamos en qué carácter/fila/celda caen.
  const charIndex = x < 5 * charScale ? 0 : 1;
  const localX = charIndex === 0 ? x : x - 5 * charScale - gapPx;
  if (localX < 0 || localX >= 5 * charScale) return false;
  if (y < 0 || y >= totalHeight) return false;
  const glyph = charIndex === 0 ? GLYPHS.E : GLYPHS.T;
  const row = Math.floor(y / charScale);
  const col = Math.floor(localX / charScale);
  return glyph[row][col] === '1';
}

function buildPng(size) {
  // Color del fondo: muy oscuro (#0a0a0a) — coherente con la paleta accent.
  const BG = [0x0a, 0x0a, 0x0a, 0xff];
  const FG = [0xfa, 0xfa, 0xfa, 0xff];
  // Esquinas redondeadas (radio ~18% del tamaño).
  const radius = Math.floor(size * 0.18);
  // Texto "ET" centrado: ~52% del tamaño.
  const charScale = Math.max(1, Math.floor((size * 0.52) / 7));
  const textCols = 2;
  const textRows = 1;
  const gapPx = Math.floor(charScale * 1.0);
  const textWidth = textCols * 5 * charScale + gapPx;
  const textHeight = textRows * 7 * charScale;
  const textX0 = Math.floor((size - textWidth) / 2);
  const textY0 = Math.floor((size - textHeight) / 2);

  const stride = 1 + size * 4; // 1 filter byte + RGBA
  const raw = Buffer.alloc(stride * size);

  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      // Esquina redondeada vía distancia al centro del círculo de esquina.
      let inside = true;
      const corners = [
        [radius, radius],
        [size - radius, radius],
        [radius, size - radius],
        [size - radius, size - radius],
      ];
      if (x < radius && y < radius) {
        const dx = radius - x,
          dy = radius - y;
        if (dx * dx + dy * dy > radius * radius) inside = false;
      } else if (x >= size - radius && y < radius) {
        const dx = x - (size - radius - 1),
          dy = radius - y;
        if (dx * dx + dy * dy > radius * radius) inside = false;
      } else if (x < radius && y >= size - radius) {
        const dx = radius - x,
          dy = y - (size - radius - 1);
        if (dx * dx + dy * dy > radius * radius) inside = false;
      } else if (x >= size - radius && y >= size - radius) {
        const dx = x - (size - radius - 1),
          dy = y - (size - radius - 1);
        if (dx * dx + dy * dy > radius * radius) inside = false;
      }
      void corners;

      let color;
      if (!inside) {
        color = [0, 0, 0, 0]; // transparente fuera del cuadrado redondeado
      } else {
        const lx = x - textX0;
        const ly = y - textY0;
        const ink = lx >= 0 && ly >= 0 && isInkAt(textCols, textRows, charScale, gapPx, lx, ly);
        color = ink ? FG : BG;
      }

      const off = y * stride + 1 + x * 4;
      raw[off] = color[0];
      raw[off + 1] = color[1];
      raw[off + 2] = color[2];
      raw[off + 3] = color[3];
    }
  }

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const idat = deflateSync(raw);

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idat),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

const targets = [
  { size: 180, file: 'apple-touch-icon.png' },
  { size: 192, file: 'icon-192.png' },
  { size: 512, file: 'icon-512.png' },
];

for (const { size, file } of targets) {
  const png = buildPng(size);
  const out = resolve(PUBLIC, file);
  writeFileSync(out, png);
  console.log(`wrote ${out}  (${size}x${size}, ${png.length} bytes)`);
}
