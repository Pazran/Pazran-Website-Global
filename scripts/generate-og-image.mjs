import sharp from 'sharp';

const W = 1200;
const H = 630;

// Create a raw RGBA buffer
const buf = Buffer.alloc(W * H * 4);

function setPixel(x, y, r, g, b, a = 255) {
  const i = (y * W + x) * 4;
  buf[i] = r;
  buf[i+1] = g;
  buf[i+2] = b;
  buf[i+3] = a;
}

function drawRect(x1, y1, x2, y2, r, g, b, a = 255) {
  for (let y = y1; y <= y2; y++) {
    for (let x = x1; x <= x2; x++) {
      setPixel(x, y, r, g, b, a);
    }
  }
}

function drawCircle(cx, cy, radius, r, g, b, a = 255) {
  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx*dx + dy*dy <= radius*radius) {
        setPixel(x, y, r, g, b, a);
      }
    }
  }
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Background gradient (dark)
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const t = (x + y) / (W + H);
    const r = Math.floor(lerp(3, 8, t));
    const g = Math.floor(lerp(5, 11, t));
    const b = Math.floor(lerp(10, 20, t));
    setPixel(x, y, r, g, b);
  }
}

// Cyan glow - radial gradient center
const glowCx = W / 2;
const glowCy = H / 2 - 30;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const dx = x - glowCx;
    const dy = y - glowCy;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const intensity = Math.max(0, 1 - dist / 400);
    const alpha = Math.floor(intensity * 12);
    if (alpha > 0) {
      const i = (y * W + x) * 4;
      buf[i] = Math.min(255, buf[i] + Math.floor(14 * intensity));
      buf[i+1] = Math.min(255, buf[i+1] + Math.floor(165 * intensity * 0.6));
      buf[i+2] = Math.min(255, buf[i+2] + Math.floor(233 * intensity * 0.5));
    }
  }
}

// Frame - rounded square
const frameSize = 130;
const frameX = Math.floor((W - frameSize) / 2);
const frameY = Math.floor((H - frameSize) / 2) - 15;
const frameR = 26; // corner radius

// Draw frame (rounded rect using circles at corners + rects)
const cx1 = frameX + frameR;
const cy1 = frameY + frameR;
const cx2 = frameX + frameSize - frameR;
const cy2 = frameY + frameSize - frameR;

// Outer glow
drawCircle(frameX + frameSize/2, frameY + frameSize/2, 80, 14, 165, 233, 15);

// Draw rounded rectangle outline
const outline = 4;
for (let oy = 0; oy < frameSize; oy++) {
  for (let ox = 0; ox < frameSize; ox++) {
    const gx = frameX + ox;
    const gy = frameY + oy;
    // Check if on outline
    const inCornerTL = (ox < frameR && oy < frameR) ? (ox-frameR)*(ox-frameR) + (oy-frameR)*(oy-frameR) <= frameR*frameR : true;
    const inCornerTR = (ox > frameSize-frameR && oy < frameR) ? (ox-(frameSize-frameR))*(ox-(frameSize-frameR)) + (oy-frameR)*(oy-frameR) <= frameR*frameR : true;
    const inCornerBL = (ox < frameR && oy > frameSize-frameR) ? (ox-frameR)*(ox-frameR) + (oy-(frameSize-frameR))*(oy-(frameSize-frameR)) <= frameR*frameR : true;
    const inCornerBR = (ox > frameSize-frameR && oy > frameSize-frameR) ? (ox-(frameSize-frameR))*(ox-(frameSize-frameR)) + (oy-(frameSize-frameR))*(oy-(frameSize-frameR)) <= frameR*frameR : true;
    
    const insideRounded = inCornerTL && inCornerTR && inCornerBL && inCornerBR;
    const insideInner = (ox >= outline && ox < frameSize - outline && oy >= outline && oy < frameSize - outline);
    // Check corners for inner
    const inInnerTL = (ox < frameR-outline && oy < frameR-outline) ? Math.abs((ox-frameR)*(ox-frameR) + (oy-frameR)*(oy-frameR)) : true;
    // simplified: just use outline approach
    
    if (insideRounded) {
      const onBorder = ox < outline || ox >= frameSize - outline || oy < outline || oy >= frameSize - outline;
      const inInnerTLc = (ox < frameR && oy < frameR) ? (ox-frameR)*(ox-frameR) + (oy-frameR)*(oy-frameR) > (frameR-outline)*(frameR-outline) : false;
      const inInnerTRc = (ox > frameSize-frameR && oy < frameR) ? (ox-(frameSize-frameR))*(ox-(frameSize-frameR)) + (oy-frameR)*(oy-frameR) > (frameR-outline)*(frameR-outline) : false;
      const inInnerBLc = (ox < frameR && oy > frameSize-frameR) ? (ox-frameR)*(ox-frameR) + (oy-(frameSize-frameR))*(oy-(frameSize-frameR)) > (frameR-outline)*(frameR-outline) : false;
      const inInnerBRc = (ox > frameSize-frameR && oy > frameSize-frameR) ? (ox-(frameSize-frameR))*(ox-(frameSize-frameR)) + (oy-(frameSize-frameR))*(oy-(frameSize-frameR)) > (frameR-outline)*(frameR-outline) : false;
      
      const isBorder = onBorder || inInnerTLc || inInnerTRc || inInnerBLc || inInnerBRc;
      // Actually just do simple outline
    }
  }
}

// Simpler approach: just draw a P using rectangles
// Actually, let me just use sharp's overlay/composite approach
// This pixel approach is too complex for a rounded rect

// Let me rebuild using sharp's built-in SVG rendering for the shapes,
// composited on top of a gradient

await sharp({
  create: {
    width: W,
    height: H,
    channels: 4,
    background: { r: 3, g: 5, b: 10, alpha: 1 }
  }
})
  .composite([
    // Gradient overlay
    {
      input: Buffer.from(`<svg width="${W}" height="${H}">
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
      </svg>`),
      top: 0,
      left: 0,
    },
    // Rounded square frame
    {
      input: Buffer.from(`<svg width="${frameSize}" height="${frameSize}">
        <rect x="0" y="0" width="${frameSize}" height="${frameSize}" rx="${frameR}" ry="${frameR}"
              fill="none" stroke="url(#border)" stroke-width="4"/>
        <defs>
          <linearGradient id="border" x1="0" y1="0" x2="${frameSize}" y2="${frameSize}">
            <stop offset="0%" stop-color="#0ea5e9"/>
            <stop offset="100%" stop-color="#14b8a6"/>
          </linearGradient>
        </defs>
      </svg>`),
      top: frameY,
      left: frameX,
    },
    // P letter (built from paths)
    {
      input: Buffer.from(`<svg width="${frameSize}" height="${frameSize}">
        <g transform="translate(${frameSize/2}, ${frameSize/2})">
          <!-- P stem -->
          <rect x="-18" y="-30" width="12" height="60" rx="2" fill="url(#border)"/>
          <!-- P bowl outer -->
          <path d="M-6 -30 H12 C28 -30 36 -15 36 0 C36 15 28 30 12 30 H-6 Z" fill="url(#border)"/>
          <!-- P bowl inner (cutout) -->
          <path d="M-1 -15 H10 C18 -15 22 -7 22 0 C22 7 18 15 10 15 H-1 Z" fill="#03050a"/>
        </g>
        <defs>
          <linearGradient id="border" x1="0" y1="0" x2="${frameSize}" y2="${frameSize}">
            <stop offset="0%" stop-color="#0ea5e9"/>
            <stop offset="100%" stop-color="#14b8a6"/>
          </linearGradient>
        </defs>
      </svg>`),
      top: frameY,
      left: frameX,
    },
  ])
  .png()
  .toFile('public/og-image.png');

console.log('✅ public/og-image.png generated (sharp composited)');
