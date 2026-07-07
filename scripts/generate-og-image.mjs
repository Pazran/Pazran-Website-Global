import sharp from 'sharp';

const W = 1200;
const H = 630;

// Frame centered in image
const frameSize = 130;
const frameX = Math.floor((W - frameSize) / 2);
const frameY = Math.floor((H - frameSize) / 2) - 15;
const frameR = 26; // corner radius

// P letter offset within frame
const cx = frameSize / 2;
const cy = frameSize / 2;

await sharp({
  create: {
    width: W, height: H, channels: 4,
    background: { r: 3, g: 5, b: 10, alpha: 1 },
  },
})
  .composite([
    // Background gradient + glow
    {
      input: Buffer.from(
        `<svg width="${W}" height="${H}">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="${W}" y2="${H}">
              <stop offset="0%" stop-color="#03050a"/>
              <stop offset="100%" stop-color="#080b14"/>
            </linearGradient>
            <radialGradient id="glow" cx="50%" cy="45%" r="35%">
              <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.10"/>
              <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <rect width="${W}" height="${H}" fill="url(#g)"/>
          <rect width="${W}" height="${H}" fill="url(#glow)"/>
        </svg>`
      ),
      top: 0,
      left: 0,
    },
    // Rounded square frame (outline only)
    {
      input: Buffer.from(
        `<svg width="${frameSize}" height="${frameSize}">
          <defs>
            <linearGradient id="border" x1="0" y1="0" x2="${frameSize}" y2="${frameSize}">
              <stop offset="0%" stop-color="#0ea5e9"/>
              <stop offset="100%" stop-color="#14b8a6"/>
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="${frameSize}" height="${frameSize}" rx="${frameR}" ry="${frameR}"
                fill="none" stroke="url(#border)" stroke-width="4"/>
        </svg>`
      ),
      top: frameY,
      left: frameX,
    },
    // P letter — solid shape, no cutout
    {
      input: Buffer.from(
        `<svg width="${frameSize}" height="${frameSize}">
          <defs>
            <linearGradient id="border" x1="0" y1="0" x2="${frameSize}" y2="${frameSize}">
              <stop offset="0%" stop-color="#0ea5e9"/>
              <stop offset="100%" stop-color="#14b8a6"/>
            </linearGradient>
          </defs>
          <g transform="translate(${cx}, ${cy})">
            <!-- Stem: vertical bar on the left -->
            <rect x="-18" y="-32" width="12" height="64" rx="2" fill="url(#border)"/>
            <!-- Bowl: solid rounded shape on the upper right of the stem -->
            <path d="M-6 -32 H12 C34 -32 40 -14 40 0 C40 14 34 26 12 26 H-6 Z" fill="url(#border)"/>
          </g>
        </svg>`
      ),
      top: frameY,
      left: frameX,
    },
  ])
  .png()
  .toFile('public/og-image.png');

console.log('✅ public/og-image.png generated');
