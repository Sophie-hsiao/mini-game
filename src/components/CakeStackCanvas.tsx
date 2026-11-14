import React, { useEffect, useRef } from 'react';
import { getFlavorForLayer } from '../constants/cakes';
import type {
  CakeFlavor,
  FallingCake,
  FloatingText,
  GameHudSnapshot,
  GameState,
  Particle,
  SlicedPiece,
  StackedCake,
} from '../types/game';
import {
  drawBackground,
  drawFallingCake,
  drawFloatingTexts,
  drawGroundCounter,
  drawParticles,
  drawPendulumAndCake,
  drawSlicedPieces,
  drawStackedTower,
} from '../utils/cakeRenderer';
import { soundFX } from '../utils/sound';

interface CakeStackCanvasProps {
  gameState: GameState;
  resetSignal: number;
  bestScore: number;
  onHudUpdate: (snapshot: GameHudSnapshot) => void;
  onGameOver: (finalSnapshot: GameHudSnapshot) => void;
}

const INITIAL_CAKE_WIDTH = 232;
const CAKE_HEIGHT = 45;
const PERFECT_TOLERANCE = 6.5;
const GRAVITY = -2350;

export const CakeStackCanvas: React.FC<CakeStackCanvasProps> = ({
  gameState,
  resetSignal,
  bestScore,
  onHudUpdate,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameStateRef = useRef<GameState>(gameState);
  const bestScoreRef = useRef<number>(bestScore);
  const onHudUpdateRef = useRef(onHudUpdate);
  const onGameOverRef = useRef(onGameOver);

  gameStateRef.current = gameState;
  bestScoreRef.current = bestScore;
  onHudUpdateRef.current = onHudUpdate;
  onGameOverRef.current = onGameOver;

  // Mutable simulation state inside ref for 60fps zero-react-rerender loop
  const simRef = useRef({
    stack: [] as StackedCake[],
    falling: null as FallingCake | null,
    slicedPieces: [] as SlicedPiece[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    cameraY: 0,
    targetCameraY: 0,
    swingPhase: 0,
    currentAngle: 0,
    currentCakeWidth: INITIAL_CAKE_WIDTH,
    currentLayer: 1,
    currentFlavor: getFlavorForLayer(1),
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    shakeTime: 0,
    shakeMagnitude: 0,
    pendingGameOverAt: null as number | null,
    nextId: 1,
    canvasWidth: 420,
    canvasHeight: 740,
    hasPendulumCake: true,
    nextCakeReadyAt: 0,
  });

  const emitHud = () => {
    const s = simRef.current;
    const isNewRecord = s.score > bestScoreRef.current && s.score > 0;
    onHudUpdateRef.current({
      score: s.score,
      layers: s.stack.length,
      bestScore: Math.max(bestScoreRef.current, s.score),
      combo: s.combo,
      maxCombo: s.maxCombo,
      perfectCount: s.perfectCount,
      currentWidthPct: Math.round((s.currentCakeWidth / INITIAL_CAKE_WIDTH) * 100),
      currentFlavor: s.currentFlavor,
      stackedFlavors: s.stack.map((c) => ({
        layer: c.layer,
        flavor: c.flavor,
        isPerfect: c.isPerfect,
        widthPct: Math.round((c.width / INITIAL_CAKE_WIDTH) * 100),
      })),
      isNewRecord,
    });
  };

  const resetSimulation = () => {
    const s = simRef.current;
    s.stack = [];
    s.falling = null;
    s.slicedPieces = [];
    s.particles = [];
    s.floatingTexts = [];
    s.cameraY = 0;
    s.targetCameraY = 0;
    s.swingPhase = 0;
    s.currentAngle = 0;
    s.currentCakeWidth = INITIAL_CAKE_WIDTH;
    s.currentLayer = 1;
    s.currentFlavor = getFlavorForLayer(1);
    s.score = 0;
    s.combo = 0;
    s.maxCombo = 0;
    s.perfectCount = 0;
    s.shakeTime = 0;
    s.shakeMagnitude = 0;
    s.pendingGameOverAt = null;
    s.hasPendulumCake = true;
    s.nextCakeReadyAt = 0;
    emitHud();
  };

  // Reset whenever resetSignal increments
  useEffect(() => {
    resetSimulation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignal]);

  const spawnBurst = (
    x: number,
    y: number,
    flavor: CakeFlavor,
    kind: 'land' | 'slice' | 'perfect' | 'applause'
  ) => {
    const s = simRef.current;
    const count = kind === 'applause' ? 36 : kind === 'perfect' ? 18 : kind === 'slice' ? 12 : 8;
    for (let i = 0; i < count; i++) {
      const angle =
        kind === 'perfect' || kind === 'applause'
          ? (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.35
          : Math.random() * Math.PI;
      const speed =
        kind === 'applause'
          ? 140 + Math.random() * 190
          : kind === 'perfect'
            ? 110 + Math.random() * 140
            : 60 + Math.random() * 120;
      const applausePalette = ['#E11D48', '#F59E0B', '#10B981', '#3B82F6', '#FFFDF8'];
      const color =
        kind === 'applause'
          ? applausePalette[i % applausePalette.length]
          : kind === 'perfect'
            ? i % 2 === 0
              ? '#F59E0B'
              : '#FFFDF8'
            : i % 3 === 0
              ? flavor.frosting
              : i % 3 === 1
                ? flavor.crumbColor
                : flavor.dripColor;
      s.particles.push({
        x: x + (Math.random() - 0.5) * (kind === 'applause' ? 80 : 14),
        y: y + Math.random() * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (kind === 'applause' ? 130 : 70),
        size:
          kind === 'applause'
            ? 5 + Math.random() * 3.5
            : kind === 'perfect'
              ? 4 + Math.random() * 3
              : 2.5 + Math.random() * 2.5,
        color,
        life: kind === 'applause' ? 0.95 : kind === 'perfect' ? 0.65 : 0.45,
        maxLife: kind === 'applause' ? 0.95 : kind === 'perfect' ? 0.65 : 0.45,
        kind: kind === 'perfect' || kind === 'applause' ? 'sparkle' : 'crumb',
      });
    }
  };

  const triggerDrop = () => {
    const s = simRef.current;
    if (gameStateRef.current !== 'PLAYING') return;
    if (s.falling || !s.hasPendulumCake || s.pendingGameOverAt !== null) return;

    soundFX.unlock();
    soundFX.playDrop();

    const w = s.canvasWidth;
    const h = s.canvasHeight;
    const groundScreenY = h - 88;
    const pivotY = 64;
    const ropeLength = Math.min(112, Math.max(72, h * 0.15));

    const hookScreenXOffset = Math.sin(s.currentAngle) * ropeLength;
    const hookScreenY = pivotY + Math.cos(s.currentAngle) * ropeLength;
    const cakeScreenBottom = hookScreenY + 15 + CAKE_HEIGHT;
    const worldBottomY = s.cameraY + (groundScreenY - cakeScreenBottom);

    s.falling = {
      id: s.nextId++,
      layer: s.currentLayer,
      x: hookScreenXOffset,
      y: worldBottomY,
      width: s.currentCakeWidth,
      height: CAKE_HEIGHT,
      vy: -95,
      angle: -s.currentAngle * 0.22,
      flavor: s.currentFlavor,
      missed: false,
      vx: 0,
      angularVelocity: 0,
    };

    s.hasPendulumCake = false;
  };

  // Keyboard support (Space / Enter / ArrowDown to drop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowDown') {
        if (gameStateRef.current === 'PLAYING') {
          e.preventDefault();
          triggerDrop();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main ResizeObserver + 60fps Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      simRef.current.canvasWidth = rect.width;
      simRef.current.canvasHeight = rect.height;
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    let rafId = 0;
    let lastTime = performance.now();

    const step = (now: number) => {
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // clamp dt on tab switch
      const s = simRef.current;

      const w = s.canvasWidth;
      const h = s.canvasHeight;
      const groundScreenY = h - 88;
      const pivotX = w / 2;
      const pivotY = 64;
      const ropeLength = Math.min(112, Math.max(72, h * 0.15));

      const maxSwingReach = Math.min(126, Math.max(54, (w - s.currentCakeWidth * 0.56) * 0.48));
      const maxAngle = Math.asin(Math.min(0.9, maxSwingReach / ropeLength));
      const omega = Math.min(4.75, 2.3 + (s.currentLayer - 1) * 0.068);

      // Update physics only when actively playing or in title preview
      if (gameStateRef.current === 'TITLE_MENU') {
        s.swingPhase += 2.1 * dt;
        s.currentAngle = Math.sin(s.swingPhase) * Math.min(0.45, maxAngle);
      } else if (gameStateRef.current === 'PLAYING') {
        s.swingPhase += omega * dt;
        s.currentAngle = Math.sin(s.swingPhase) * maxAngle;

        // Re-arm pendulum cake briefly after previous cake settles
        if (!s.hasPendulumCake && !s.falling && s.pendingGameOverAt === null && now >= s.nextCakeReadyAt) {
          s.hasPendulumCake = true;
        }

        // Update falling cake
        if (s.falling) {
          const f = s.falling;
          f.vy += GRAVITY * dt;
          f.y += f.vy * dt;
          f.x += f.vx * dt;

          if (!f.missed) {
            f.angle *= Math.pow(0.005, dt);

            const hasBase = s.stack.length > 0;
            const topCake = hasBase ? s.stack[s.stack.length - 1] : null;
            const targetY = topCake ? topCake.y + topCake.height : 0;

            if (f.y <= targetY) {
              if (!topCake) {
                // Layer 1 lands directly on the bakery marble counter!
                const newCake: StackedCake = {
                  id: f.id,
                  layer: f.layer,
                  x: f.x - f.width / 2,
                  y: 0,
                  width: f.width,
                  height: f.height,
                  flavor: f.flavor,
                  cutLeft: false,
                  cutRight: false,
                  landTime: now,
                  isPerfect: false,
                };
                s.stack.push(newCake);
                s.score += 1;
                s.currentLayer += 1;
                s.currentFlavor = getFlavorForLayer(s.currentLayer);
                s.falling = null;
                s.nextCakeReadyAt = now + 110;
                soundFX.playLand(0, false);
                spawnBurst(f.x, 4, f.flavor, 'land');
                s.floatingTexts.push({
                  id: s.nextId++,
                  x: f.x,
                  y: CAKE_HEIGHT + 16,
                  text: '+1',
                  subtext: '底座建立',
                  color: '#2D1E17',
                  life: 0.85,
                  maxLife: 0.85,
                  scale: 1,
                });
                emitHud();
              } else {
                // Layer 2+: Check alignment with topCake
                const fallLeft = f.x - f.width / 2;
                const fallRight = f.x + f.width / 2;
                const topLeft = topCake.x;
                const topRight = topCake.x + topCake.width;

                const overlapLeft = Math.max(fallLeft, topLeft);
                const overlapRight = Math.min(fallRight, topRight);
                const overlapWidth = overlapRight - overlapLeft;

                if (overlapWidth <= 2.5) {
                  // Complete miss -> Game Over!
                  f.missed = true;
                  const dir = f.x >= topLeft + topCake.width / 2 ? 1 : -1;
                  f.vx = dir * 55;
                  f.angularVelocity = dir * 2.8;
                  s.shakeTime = 0.25;
                  s.shakeMagnitude = 6;
                  s.pendingGameOverAt = now + 560;
                  soundFX.playGameOver();
                  s.floatingTexts.push({
                    id: s.nextId++,
                    x: f.x,
                    y: targetY + 24,
                    text: '沒對齊！',
                    color: '#E11D48',
                    life: 0.9,
                    maxLife: 0.9,
                    scale: 1.05,
                  });
                } else {
                  const dx = fallLeft - topLeft;
                  const isPerfect = Math.abs(dx) <= PERFECT_TOLERANCE;

                  if (isPerfect) {
                    s.combo += 1;
                    s.perfectCount += 1;
                    s.maxCombo = Math.max(s.maxCombo, s.combo);

                    let finalWidth = topCake.width;
                    let finalX = topLeft;
                    let widthRecovered = false;

                    // Reward 5+ perfect streak with slight width recovery if previously sliced
                    if (s.combo >= 5 && finalWidth < INITIAL_CAKE_WIDTH) {
                      const recover = Math.min(8, INITIAL_CAKE_WIDTH - finalWidth);
                      finalWidth += recover;
                      finalX -= recover / 2;
                      widthRecovered = true;
                    }

                    const newCake: StackedCake = {
                      id: f.id,
                      layer: f.layer,
                      x: finalX,
                      y: targetY,
                      width: finalWidth,
                      height: f.height,
                      flavor: f.flavor,
                      cutLeft: topCake.cutLeft && !widthRecovered,
                      cutRight: topCake.cutRight && !widthRecovered,
                      landTime: now,
                      isPerfect: true,
                    };

                    s.stack.push(newCake);
                    s.currentCakeWidth = finalWidth;
                    const pointsEarned = 1 + Math.min(s.combo, 4);
                    s.score += pointsEarned;
                    s.currentLayer += 1;
                    s.currentFlavor = getFlavorForLayer(s.currentLayer);
                    s.falling = null;
                    s.nextCakeReadyAt = now + 110;

                    const landedLayer = s.stack.length;
                    soundFX.playLand(s.combo, true);

                    if (landedLayer === 5) {
                      soundFX.playApplause();
                      spawnBurst(finalX + finalWidth / 2, targetY + CAKE_HEIGHT, f.flavor, 'applause');
                      s.floatingTexts.push({
                        id: s.nextId++,
                        x: finalX + finalWidth / 2,
                        y: targetY + CAKE_HEIGHT + 22,
                        text: '掌聲鼓勵！👏 第 5 層',
                        subtext: widthRecovered
                          ? `完美對齊 ×${s.combo} · +${pointsEarned} · 寬度回復`
                          : `完美對齊 ×${s.combo} · +${pointsEarned}`,
                        color: '#E11D48',
                        life: 1.35,
                        maxLife: 1.35,
                        scale: 1.15,
                      });
                    } else {
                      spawnBurst(finalX + finalWidth / 2, targetY, f.flavor, 'perfect');
                      const praisePrefix = landedLayer > 5 ? '好棒！' : '';
                      const titleText =
                        s.combo > 1
                          ? `${praisePrefix}完美對齊 ×${s.combo}`
                          : `${praisePrefix}完美對齊！`;
                      s.floatingTexts.push({
                        id: s.nextId++,
                        x: finalX + finalWidth / 2,
                        y: targetY + CAKE_HEIGHT + 18,
                        text: titleText,
                        subtext: widthRecovered ? `+${pointsEarned} · 寬度回復` : `+${pointsEarned}`,
                        color: '#D97706',
                        life: 1.0,
                        maxLife: 1.0,
                        scale: 1.08,
                      });
                    }
                  } else {
                    // Partial alignment: slice off the overhanging excess!
                    s.combo = 0;
                    const cutLeftSide = fallLeft < topLeft;
                    const cutRightSide = fallRight > topRight;

                    const newCake: StackedCake = {
                      id: f.id,
                      layer: f.layer,
                      x: overlapLeft,
                      y: targetY,
                      width: overlapWidth,
                      height: f.height,
                      flavor: f.flavor,
                      cutLeft: cutLeftSide,
                      cutRight: cutRightSide,
                      landTime: now,
                      isPerfect: false,
                    };

                    // Spawn tumbling sliced piece for excess overhang
                    if (cutLeftSide) {
                      const trimW = topLeft - fallLeft;
                      if (trimW > 1) {
                        s.slicedPieces.push({
                          id: s.nextId++,
                          x: fallLeft + trimW / 2,
                          y: targetY,
                          width: trimW,
                          height: f.height,
                          vx: -85 - Math.random() * 45,
                          vy: 45,
                          angle: 0,
                          angularVelocity: -3.6 - Math.random() * 1.6,
                          side: 'left',
                          flavor: f.flavor,
                          opacity: 1,
                        });
                      }
                      spawnBurst(topLeft, targetY + f.height * 0.5, f.flavor, 'slice');
                    }
                    if (cutRightSide) {
                      const trimW = fallRight - topRight;
                      if (trimW > 1) {
                        s.slicedPieces.push({
                          id: s.nextId++,
                          x: topRight + trimW / 2,
                          y: targetY,
                          width: trimW,
                          height: f.height,
                          vx: 85 + Math.random() * 45,
                          vy: 45,
                          angle: 0,
                          angularVelocity: 3.6 + Math.random() * 1.6,
                          side: 'right',
                          flavor: f.flavor,
                          opacity: 1,
                        });
                      }
                      spawnBurst(topRight, targetY + f.height * 0.5, f.flavor, 'slice');
                    }

                    s.stack.push(newCake);
                    s.currentCakeWidth = overlapWidth;
                    s.score += 1;
                    s.currentLayer += 1;
                    s.currentFlavor = getFlavorForLayer(s.currentLayer);
                    s.falling = null;
                    s.nextCakeReadyAt = now + 110;

                    const landedLayer = s.stack.length;
                    soundFX.playLand(0, false);
                    soundFX.playSlice();

                    if (landedLayer === 5) {
                      soundFX.playApplause();
                      spawnBurst(overlapLeft + overlapWidth / 2, targetY + CAKE_HEIGHT, f.flavor, 'applause');
                      s.floatingTexts.push({
                        id: s.nextId++,
                        x: overlapLeft + overlapWidth / 2,
                        y: targetY + CAKE_HEIGHT + 22,
                        text: '掌聲鼓勵！👏 第 5 層',
                        subtext: '+1',
                        color: '#E11D48',
                        life: 1.35,
                        maxLife: 1.35,
                        scale: 1.15,
                      });
                    } else if (landedLayer > 5) {
                      s.floatingTexts.push({
                        id: s.nextId++,
                        x: overlapLeft + overlapWidth / 2,
                        y: targetY + CAKE_HEIGHT + 16,
                        text: '好棒！ +1',
                        color: '#B45309',
                        life: 0.9,
                        maxLife: 0.9,
                        scale: 1.05,
                      });
                    } else {
                      s.floatingTexts.push({
                        id: s.nextId++,
                        x: overlapLeft + overlapWidth / 2,
                        y: targetY + CAKE_HEIGHT + 16,
                        text: '+1',
                        color: '#2D1E17',
                        life: 0.75,
                        maxLife: 0.75,
                        scale: 0.95,
                      });
                    }
                  }

                  // Pan camera upward so tower top stays comfortably in lower-middle viewport
                  const towerTopY = targetY + CAKE_HEIGHT;
                  const desiredTopScreenY = Math.max(h * 0.62, groundScreenY - 175);
                  s.targetCameraY = Math.max(0, towerTopY - (groundScreenY - desiredTopScreenY));
                  emitHud();
                }
              }
            }
          } else {
            // Tumbling missed cake rotation
            f.angle += f.angularVelocity * dt;
          }
        }

        // Check delayed Game Over trigger after watching missed cake fall
        if (s.pendingGameOverAt !== null && now >= s.pendingGameOverAt) {
          s.pendingGameOverAt = null;
          const isNewRecord = s.score > bestScoreRef.current && s.score > 0;
          onGameOverRef.current({
            score: s.score,
            layers: s.stack.length,
            bestScore: Math.max(bestScoreRef.current, s.score),
            combo: s.combo,
            maxCombo: s.maxCombo,
            perfectCount: s.perfectCount,
            currentWidthPct: Math.round((s.currentCakeWidth / INITIAL_CAKE_WIDTH) * 100),
            currentFlavor: s.currentFlavor,
            stackedFlavors: s.stack.map((c) => ({
              layer: c.layer,
              flavor: c.flavor,
              isPerfect: c.isPerfect,
              widthPct: Math.round((c.width / INITIAL_CAKE_WIDTH) * 100),
            })),
            isNewRecord,
          });
        }
      }

      // Update secondary visual physics (camera lerp, sliced pieces, particles, texts)
      if (gameStateRef.current !== 'PAUSED') {
        s.cameraY += (s.targetCameraY - s.cameraY) * (1 - Math.exp(-5.5 * dt));

        for (let i = s.slicedPieces.length - 1; i >= 0; i--) {
          const p = s.slicedPieces[i];
          p.vy += GRAVITY * 0.75 * dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.angle += p.angularVelocity * dt;
          if (p.y < s.cameraY - 220) {
            s.slicedPieces.splice(i, 1);
          }
        }

        for (let i = s.particles.length - 1; i >= 0; i--) {
          const pt = s.particles[i];
          pt.vy += -620 * dt;
          pt.x += pt.vx * dt;
          pt.y += pt.vy * dt;
          pt.life -= dt;
          if (pt.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y += 38 * dt;
          ft.life -= dt;
          if (ft.life <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        if (s.shakeTime > 0) {
          s.shakeTime = Math.max(0, s.shakeTime - dt);
        }
      }

      // ---- RENDER FRAME ----
      ctx.save();
      if (s.shakeTime > 0) {
        const mag = s.shakeMagnitude * (s.shakeTime / 0.25);
        ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
      }

      drawBackground(ctx, w, h, s.cameraY, groundScreenY, now / 1000);

      const baseCake = s.stack[0] ?? null;
      drawGroundCounter(
        ctx,
        w,
        h,
        groundScreenY,
        s.cameraY,
        baseCake ? baseCake.x : null,
        baseCake ? baseCake.width : INITIAL_CAKE_WIDTH
      );

      drawStackedTower(ctx, s.stack, w, h, groundScreenY, s.cameraY, now);

      if (s.falling) {
        drawFallingCake(ctx, s.falling, w, groundScreenY, s.cameraY);
      }

      drawSlicedPieces(ctx, s.slicedPieces, w, groundScreenY, s.cameraY);
      drawParticles(ctx, s.particles, w, groundScreenY, s.cameraY);

      if (gameStateRef.current === 'PLAYING' || gameStateRef.current === 'TITLE_MENU') {
        drawPendulumAndCake(
          ctx,
          pivotX,
          pivotY,
          ropeLength,
          s.currentAngle,
          s.currentCakeWidth,
          CAKE_HEIGHT,
          s.currentFlavor,
          gameStateRef.current === 'TITLE_MENU' ? true : s.hasPendulumCake
        );
      }

      drawFloatingTexts(ctx, s.floatingTexts, w, groundScreenY, s.cameraY);
      ctx.restore();

      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={(e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        triggerDrop();
      }}
      className="block w-full h-full touch-none select-none cursor-pointer"
      aria-label="蛋糕疊疊樂遊戲畫布，點擊螢幕落下蛋糕"
    />
  );
};
