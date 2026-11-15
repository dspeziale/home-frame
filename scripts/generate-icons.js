// Pure Node script to generate valid PNG icon files for PWA
import fs from 'fs';
import zlib from 'zlib';

function createPNG(width, height, colorR, colorG, colorB) {
  // Minimal uncompressed raw image buffer
  const rowBytes = 1 + width * 4; // 1 filter byte (0) + RGBA per pixel
  const rawData = Buffer.alloc(rowBytes * height);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowBytes;
    rawData[rowStart] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      
      // Rounded corner check
      const radius = Math.floor(width * 0.22);
      let inCorner = false;
      const checkCorner = (cx, cy) => {
        const dx = x - cx;
        const dy = y - cy;
        return (dx * dx + dy * dy) > (radius * radius);
      };

      if (x < radius && y < radius && checkCorner(radius, radius)) inCorner = true;
      if (x > width - radius && y < radius && checkCorner(width - radius, radius)) inCorner = true;
      if (x < radius && y > height - radius && checkCorner(radius, height - radius)) inCorner = true;
      if (x > width - radius && y > height - radius && checkCorner(width - radius, height - radius)) inCorner = true;

      if (inCorner) {
        rawData[px] = 0;
        rawData[px + 1] = 0;
        rawData[px + 2] = 0;
        rawData[px + 3] = 0;
      } else {
        // Gradient
        const factor = (x + y) / (width + height);
        rawData[px] = Math.round(colorR * (1 - factor * 0.3));
        rawData[px + 1] = Math.round(colorG * (1 - factor * 0.2));
        rawData[px + 2] = Math.round(colorB);
        rawData[px + 3] = 255;
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeInt32BE(crc, 0);

    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Simple CRC32 implementation
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    return crc ^ -1;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = chunk('IHDR', ihdrData);
  const idatChunk = chunk('IDAT', deflated);
  const iendChunk = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

fs.writeFileSync('public/pwa-192x192.png', createPNG(192, 192, 37, 99, 235));
fs.writeFileSync('public/pwa-512x512.png', createPNG(512, 512, 37, 99, 235));
fs.writeFileSync('public/apple-touch-icon.png', createPNG(180, 180, 37, 99, 235));
console.log('PWA PNG icons generated successfully!');
