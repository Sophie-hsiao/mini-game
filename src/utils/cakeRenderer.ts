import type {
  CakeFlavor,
  FallingCake,
  FloatingText,
  Particle,
  SlicedPiece,
  StackedCake,
} from '../types/game';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '');
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpColor(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const r = Math.round(lerp(c1.r, c2.r, t));
  const g = Math.round(lerp(c1.g, c2.g, t));
  const b = Math.round(lerp(c1.b, c2.b, t));
  return `rgb(${r}, ${g}, ${b})`;
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraY: number,
  groundScreenY: number,
  timeSec: number
) {
  // Altitude stages as tower climbs
  // Stage 0: Bakery Cream (cameraY 0 -> 450)
  // Stage 1: Morning Sky (cameraY 450 -> 1150)
  // Stage 2: Pastel Sunset (cameraY 1150 -> 1950)
  // Stage 3: Starry Dusk (cameraY 1950+)
  let topHex = '#F6E8D7';
  let bottomHex = '#FFFBF5';

  if (cameraY < 450) {
    const t = cameraY / 450;
    topHex = lerpColor('#F6E8D7', '#DDF0FA', t);
    bottomHex = lerpColor('#FFFBF5', '#FFF7EE', t);
  } else if (cameraY < 1150) {
    const t = (cameraY - 450) / 700;
    topHex = lerpColor('#DDF0FA', '#F7C9B6', t);
    bottomHex = lerpColor('#FFF7EE', '#FDE9C9', t);
  } else if (cameraY < 1950) {
    const t = (cameraY - 1150) / 800;
    topHex = lerpColor('#F7C9B6', '#1F2247', t);
    bottomHex = lerpColor('#FDE9C9', '#4A3A69', t);
  } else {
    topHex = '#171936';
    bottomHex = '#332A52';
  }

  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, topHex);
  skyGrad.addColorStop(1, bottomHex);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle bakery window paneling near ground level (fades out as camera rises)
  if (cameraY < 550) {
    const bakeryAlpha = Math.max(0, 1 - cameraY / 420);
    ctx.save();
    ctx.globalAlpha = bakeryAlpha * 0.45;
    const parallaxY = cameraY * 0.65;

    // Soft arched bakery windows in background
    const windowW = Math.min(130, width * 0.28);
    const windowH = 210;
    const windowBaseY = groundScreenY - 110 + parallaxY;
    const leftWinX = width * 0.22 - windowW / 2;
    const rightWinX = width * 0.78 - windowW / 2;

    [leftWinX, rightWinX].forEach((wx) => {
      if (windowBaseY - windowH < height && windowBaseY > 0) {
        ctx.fillStyle = '#FFFDF9';
        ctx.beginPath();
        ctx.roundRect(wx, windowBaseY - windowH, windowW, windowH, [windowW / 2, windowW / 2, 4, 4]);
        ctx.fill();

        ctx.strokeStyle = '#DFCBB5';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Window crossbars
        ctx.beginPath();
        ctx.moveTo(wx + windowW / 2, windowBaseY - windowH + 14);
        ctx.lineTo(wx + windowW / 2, windowBaseY);
        ctx.moveTo(wx, windowBaseY - windowH * 0.48);
        ctx.lineTo(wx + windowW, windowBaseY - windowH * 0.48);
        ctx.stroke();
      }
    });

    // Subtle striped awning shadow at top of bakery wall
    const awningY = groundScreenY - 380 + parallaxY;
    if (awningY > -60 && awningY < height) {
      ctx.fillStyle = '#ECD9C4';
      ctx.fillRect(0, awningY, width, 12);
    }
    ctx.restore();
  }

  // Drifting clouds in sky & sunset altitudes
  if (cameraY > 180 && cameraY < 2100) {
    const cloudAlpha =
      cameraY < 450
        ? (cameraY - 180) / 270
        : cameraY > 1500
          ? Math.max(0, 1 - (cameraY - 1500) / 600)
          : 1;
    ctx.save();
    ctx.globalAlpha = cloudAlpha * 0.55;
    ctx.fillStyle = cameraY > 1100 ? '#FFE8D9' : '#FFFFFF';

    for (let i = 0; i < 6; i++) {
      const worldCloudY = 380 + i * 280;
      const screenCloudY = groundScreenY - (worldCloudY - cameraY * 0.75);
      if (screenCloudY < -80 || screenCloudY > height + 80) continue;

      const drift = ((timeSec * (8 + (i % 3) * 4) + i * 130) % (width + 180)) - 90;
      drawCloud(ctx, drift, screenCloudY, 0.75 + (i % 3) * 0.22);
    }
    ctx.restore();
  }

  // Twinkling stars in high twilight altitude
  if (cameraY > 1250) {
    const starAlpha = Math.min(1, (cameraY - 1250) / 600);
    ctx.save();
    for (let i = 0; i < 28; i++) {
      const sx = ((i * 97.3) % 1) * width;
      const sy = ((i * 53.7) % 0.85) * height;
      const twinkle = 0.35 + 0.65 * Math.abs(Math.sin(timeSec * 1.8 + i * 1.3));
      ctx.globalAlpha = starAlpha * twinkle * 0.85;
      ctx.fillStyle = i % 5 === 0 ? '#FDE68A' : '#FFFFFF';
      const radius = i % 4 === 0 ? 2.1 : 1.3;
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.arc(22, -6, 26, 0, Math.PI * 2);
  ctx.arc(48, 0, 20, 0, Math.PI * 2);
  ctx.arc(24, 8, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawGroundCounter(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundScreenY: number,
  cameraY: number,
  basePlateX: number | null,
  basePlateWidth: number
) {
  const screenY = groundScreenY + cameraY;
  if (screenY > height + 40) return;

  // Marble pastry countertop
  const counterGrad = ctx.createLinearGradient(0, screenY, 0, height);
  counterGrad.addColorStop(0, '#F5EDE3');
  counterGrad.addColorStop(0.16, '#E8DAC9');
  counterGrad.addColorStop(1, '#D3BFA9');

  ctx.fillStyle = counterGrad;
  ctx.fillRect(0, screenY, width, height - screenY + 40);

  // Subtle marble top lip & warm brass inlay line
  ctx.fillStyle = '#FFFDF9';
  ctx.fillRect(0, screenY, width, 4);

  ctx.fillStyle = '#C99E67';
  ctx.fillRect(0, screenY + 4, width, 2);

  // Soft counter front trim
  ctx.fillStyle = 'rgba(72, 46, 30, 0.08)';
  ctx.fillRect(0, screenY + 14, width, 6);

  // Center guide marker on the counter before first cake lands
  const centerX = width / 2;
  if (basePlateX === null) {
    ctx.save();
    ctx.strokeStyle = 'rgba(180, 130, 86, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(centerX - 75, screenY + 1);
    ctx.lineTo(centerX + 75, screenY + 1);
    ctx.stroke();

    // Subtle porcelain serving doily / mat on counter center
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.beginPath();
    ctx.roundRect(centerX - basePlateWidth / 2 - 14, screenY - 3, basePlateWidth + 28, 6, 3);
    ctx.fill();
    ctx.restore();
  } else {
    // Draw sleek porcelain & brass cake pedestal plate seated cleanly under the first cake
    const plateLeft = centerX + basePlateX - 14;
    const plateW = basePlateWidth + 28;
    ctx.save();
    ctx.fillStyle = 'rgba(45, 30, 23, 0.14)';
    ctx.beginPath();
    ctx.ellipse(centerX + basePlateX + basePlateWidth / 2, screenY + 3, plateW * 0.52, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFDF9';
    ctx.strokeStyle = '#C99E67';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(plateLeft, screenY - 5, plateW, 7, 3.5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

export function drawCakeShape(
  ctx: CanvasRenderingContext2D,
  screenLeft: number,
  screenBottom: number,
  cakeWidth: number,
  cakeHeight: number,
  flavor: CakeFlavor,
  options: {
    cutLeft?: boolean;
    cutRight?: boolean;
    squash?: number; // 0..1 bounce factor
    isTopLayer?: boolean;
    showShadow?: boolean;
  } = {}
) {
  if (cakeWidth <= 0.5 || cakeHeight <= 0.5) return;

  const { cutLeft = false, cutRight = false, squash = 0, showShadow = true } = options;

  // Squash & stretch around bottom center
  const scaleY = 1 - squash * 0.14;
  const scaleX = 1 + squash * 0.06;
  const cx = screenLeft + cakeWidth / 2;

  ctx.save();
  ctx.translate(cx, screenBottom);
  ctx.scale(scaleX, scaleY);
  ctx.translate(-cakeWidth / 2, -cakeHeight);

  const w = cakeWidth;
  const h = cakeHeight;
  const leftRadius = cutLeft ? 0 : Math.min(6, w * 0.18);
  const rightRadius = cutRight ? 0 : Math.min(6, w * 0.18);

  // Drop shadow on layer below
  if (showShadow) {
    ctx.fillStyle = 'rgba(45, 25, 15, 0.14)';
    ctx.beginPath();
    ctx.roundRect(1, h - 2, Math.max(0, w - 2), 4, 2);
    ctx.fill();
  }

  // Clip entire cake body so cut edges are razor-clean
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, [leftRadius, rightRadius, Math.min(3, leftRadius), Math.min(3, rightRadius)]);
  ctx.clip();

  // Sponge body gradient
  const spongeGrad = ctx.createLinearGradient(0, 0, 0, h);
  spongeGrad.addColorStop(0, flavor.spongeTop);
  spongeGrad.addColorStop(1, flavor.spongeBottom);
  ctx.fillStyle = spongeGrad;
  ctx.fillRect(0, 0, w, h);

  // Subtle sponge crumb texture dots
  ctx.fillStyle = 'rgba(0, 0, 0, 0.06)';
  for (let gx = 6; gx < w - 4; gx += 12) {
    ctx.fillRect(gx, h * 0.34, 1.5, 1.5);
    ctx.fillRect(gx + 5, h * 0.72, 1.5, 1.5);
  }

  // Middle whipped cream filling layer
  const midY = h * 0.52;
  const midH = Math.max(4, h * 0.16);
  ctx.fillStyle = flavor.filling;
  ctx.fillRect(0, midY, w, midH);

  // Delicate dark seam under filling for crisp contrast
  ctx.fillStyle = 'rgba(60, 35, 20, 0.08)';
  ctx.fillRect(0, midY + midH, w, 1);

  // Top frosting cap
  const frostH = Math.max(7, h * 0.27);
  ctx.fillStyle = flavor.frosting;
  ctx.fillRect(0, 0, w, frostH);

  // Glossy top highlight strip
  ctx.fillStyle = flavor.frostingHighlight;
  ctx.fillRect(0, 1, w, 3);

  // Scalloped glaze drips along top edge
  ctx.fillStyle = flavor.dripColor;
  ctx.fillRect(0, 0, w, 4.5);

  const dripSpacing = 14;
  for (let dx = 4; dx < w - 3; dx += dripSpacing) {
    const dripLen = 5 + ((Math.round(dx * 7) % 3) * 3);
    ctx.beginPath();
    ctx.roundRect(dx, 3, 5, dripLen, [0, 0, 3, 3]);
    ctx.fill();
  }

  // Fresh cut cross-section highlight on sliced edges
  if (cutLeft) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(0, 0, 2, h);
    ctx.fillStyle = 'rgba(45, 25, 15, 0.16)';
    ctx.fillRect(0, 0, 0.8, h);
  }
  if (cutRight) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.fillRect(w - 2, 0, 2, h);
    ctx.fillStyle = 'rgba(45, 25, 15, 0.16)';
    ctx.fillRect(w - 0.8, 0, 0.8, h);
  }

  ctx.restore(); // end body clip

  // Subtle crisp outer contour for legibility against bright backgrounds
  ctx.strokeStyle = 'rgba(65, 38, 22, 0.18)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(0, 0, w, h, [leftRadius, rightRadius, Math.min(3, leftRadius), Math.min(3, rightRadius)]);
  ctx.stroke();

  // Toppings sitting gracefully on top of the cake (only if wide enough)
  if (w >= 26) {
    drawToppings(ctx, w, flavor);
  }

  ctx.restore();
}

function drawToppings(ctx: CanvasRenderingContext2D, w: number, flavor: CakeFlavor) {
  const count = Math.max(1, Math.min(4, Math.floor((w - 14) / 36)));
  const step = w / (count + 1);

  for (let i = 1; i <= count; i++) {
    const tx = step * i;
    if (flavor.topping === 'strawberry') {
      // Plump strawberry with leaf
      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.ellipse(tx, -3.5, 5.5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FB7185';
      ctx.beginPath();
      ctx.ellipse(tx - 1.5, -4.8, 1.8, 1.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.ellipse(tx, -7.5, 3.5, 1.4, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (flavor.topping === 'berry') {
      // Twin blueberries
      ctx.fillStyle = '#3730A3';
      ctx.beginPath();
      ctx.arc(tx - 2.5, -3, 3.5, 0, Math.PI * 2);
      ctx.arc(tx + 2.8, -2.5, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#818CF8';
      ctx.beginPath();
      ctx.arc(tx - 3.5, -4.2, 1.1, 0, Math.PI * 2);
      ctx.fill();
    } else if (flavor.topping === 'chocolate') {
      // Rolled chocolate curl & gold fleck
      ctx.fillStyle = '#3B1E12';
      ctx.beginPath();
      ctx.roundRect(tx - 5, -6, 10, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(tx - 1, -7, 2.5, 2);
    } else if (flavor.topping === 'matcha') {
      // Ivory cream dot + azuki bean
      ctx.fillStyle = '#FAFDF5';
      ctx.beginPath();
      ctx.arc(tx, -3, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7F1D1D';
      ctx.beginPath();
      ctx.ellipse(tx, -5.5, 2.5, 1.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (flavor.topping === 'citrus') {
      // Sunny mango cube / citrus wedge
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(tx, -2, 5.2, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = '#FEF08A';
      ctx.beginPath();
      ctx.arc(tx, -2, 3.5, Math.PI, 0);
      ctx.fill();
    } else {
      // Classic piped cream rosette
      ctx.fillStyle = '#FFFDF9';
      ctx.beginPath();
      ctx.arc(tx, -3.5, 4.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(180, 140, 110, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }
}

export function drawPendulumAndCake(
  ctx: CanvasRenderingContext2D,
  pivotX: number,
  pivotY: number,
  ropeLength: number,
  angle: number,
  cakeWidth: number,
  cakeHeight: number,
  flavor: CakeFlavor,
  hasCake: boolean
) {
  const hookX = pivotX + Math.sin(angle) * ropeLength;
  const hookY = pivotY + Math.cos(angle) * ropeLength;

  ctx.save();

  // Brass ceiling mount
  ctx.fillStyle = '#B8894B';
  ctx.beginPath();
  ctx.arc(pivotX, pivotY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FDE68A';
  ctx.beginPath();
  ctx.arc(pivotX - 1.5, pivotY - 1.5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Pendulum silk cord
  ctx.strokeStyle = '#6B4230';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(pivotX, pivotY);
  ctx.lineTo(hookX, hookY);
  ctx.stroke();

  // Decorative satin ribbon bow at the hook
  ctx.fillStyle = '#E11D48';
  ctx.beginPath();
  ctx.ellipse(hookX - 6, hookY - 2, 5.5, 3, -0.35, 0, Math.PI * 2);
  ctx.ellipse(hookX + 6, hookY - 2, 5.5, 3, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hookX, hookY - 1, 3, 0, Math.PI * 2);
  ctx.fill();

  // Brass carrier ring
  ctx.strokeStyle = '#B8894B';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(hookX, hookY + 3, 4.5, 0, Math.PI * 2);
  ctx.stroke();

  if (hasCake) {
    // Draw suspended cake hanging below the carrier hook with slight natural pendulum tilt
    const cakeTilt = angle * 0.22;
    ctx.save();
    ctx.translate(hookX, hookY + 7);
    ctx.rotate(-cakeTilt);

    // Subtle thin pastry sling lines cradling the cake edges
    const halfW = cakeWidth / 2;
    ctx.strokeStyle = 'rgba(130, 88, 56, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-halfW + 4, 8);
    ctx.moveTo(0, 0);
    ctx.lineTo(halfW - 4, 8);
    ctx.stroke();

    // Cake hangs with top at y = 8, bottom at y = 8 + cakeHeight
    drawCakeShape(ctx, -halfW, 8 + cakeHeight, cakeWidth, cakeHeight, flavor, {
      showShadow: false,
    });

    ctx.restore();
  }

  ctx.restore();
}

export function drawStackedTower(
  ctx: CanvasRenderingContext2D,
  stack: StackedCake[],
  canvasWidth: number,
  canvasHeight: number,
  groundScreenY: number,
  cameraY: number,
  nowMs: number
) {
  const centerX = canvasWidth / 2;

  for (let i = 0; i < stack.length; i++) {
    const cake = stack[i];
    const screenBottom = groundScreenY - (cake.y - cameraY);
    const screenTop = screenBottom - cake.height;

    // Cull off-screen cakes below or above viewport
    if (screenTop > canvasHeight + 40 || screenBottom < -40) continue;

    const elapsed = (nowMs - cake.landTime) / 1000;
    const squash = elapsed >= 0 && elapsed < 0.18 ? Math.sin((elapsed / 0.18) * Math.PI) * 0.85 : 0;

    drawCakeShape(
      ctx,
      centerX + cake.x,
      screenBottom,
      cake.width,
      cake.height,
      cake.flavor,
      {
        cutLeft: cake.cutLeft,
        cutRight: cake.cutRight,
        squash,
        showShadow: i > 0,
      }
    );
  }
}

export function drawFallingCake(
  ctx: CanvasRenderingContext2D,
  falling: FallingCake,
  canvasWidth: number,
  groundScreenY: number,
  cameraY: number
) {
  const centerX = canvasWidth / 2;
  const screenCenterX = centerX + falling.x;
  const screenBottom = groundScreenY - (falling.y - cameraY);

  ctx.save();
  ctx.translate(screenCenterX, screenBottom - falling.height / 2);
  ctx.rotate(falling.angle);
  drawCakeShape(
    ctx,
    -falling.width / 2,
    falling.height / 2,
    falling.width,
    falling.height,
    falling.flavor,
    { showShadow: false }
  );
  ctx.restore();
}

export function drawSlicedPieces(
  ctx: CanvasRenderingContext2D,
  pieces: SlicedPiece[],
  canvasWidth: number,
  groundScreenY: number,
  cameraY: number
) {
  const centerX = canvasWidth / 2;

  for (const p of pieces) {
    const sx = centerX + p.x;
    const sy = groundScreenY - (p.y - cameraY);
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.translate(sx, sy - p.height / 2);
    ctx.rotate(p.angle);
    drawCakeShape(ctx, -p.width / 2, p.height / 2, p.width, p.height, p.flavor, {
      cutLeft: p.side === 'right',
      cutRight: p.side === 'left',
      showShadow: false,
    });
    ctx.restore();
  }
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  canvasWidth: number,
  groundScreenY: number,
  cameraY: number
) {
  const centerX = canvasWidth / 2;
  for (const pt of particles) {
    const sx = centerX + pt.x;
    const sy = groundScreenY - (pt.y - cameraY);
    const alpha = Math.max(0, pt.life / pt.maxLife);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = pt.color;
    if (pt.kind === 'sparkle') {
      ctx.translate(sx, sy);
      ctx.rotate(pt.life * 6);
      ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
    } else {
      ctx.beginPath();
      ctx.arc(sx, sy, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function drawFloatingTexts(
  ctx: CanvasRenderingContext2D,
  texts: FloatingText[],
  canvasWidth: number,
  groundScreenY: number,
  cameraY: number
) {
  const centerX = canvasWidth / 2;
  for (const ft of texts) {
    const sx = centerX + ft.x;
    const sy = groundScreenY - (ft.y - cameraY);
    const progress = 1 - ft.life / ft.maxLife;
    const alpha = progress < 0.7 ? 1 : Math.max(0, 1 - (progress - 0.7) / 0.3);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(sx, sy);
    ctx.scale(ft.scale, ft.scale);
    ctx.textAlign = 'center';
    ctx.font = '700 18px "Plus Jakarta Sans", "Noto Sans TC", sans-serif';

    // Crisp outline for readability across sky stages
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 252, 247, 0.92)';
    ctx.strokeText(ft.text, 0, 0);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, 0, 0);

    if (ft.subtext) {
      ctx.font = '700 12px "Plus Jakarta Sans", "Noto Sans TC", sans-serif';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.subtext, 0, 18);
      ctx.fillStyle = '#6B4230';
      ctx.fillText(ft.subtext, 0, 18);
    }

    ctx.restore();
  }
}
