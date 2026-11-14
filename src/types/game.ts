export type GameState = 'TITLE_MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type ToppingStyle = 'strawberry' | 'berry' | 'chocolate' | 'matcha' | 'citrus' | 'rosette';

export interface CakeFlavor {
  id: string;
  nameZh: string;
  nameEn: string;
  spongeTop: string;
  spongeBottom: string;
  filling: string;
  frosting: string;
  frostingHighlight: string;
  dripColor: string;
  crumbColor: string;
  topping: ToppingStyle;
}

export interface StackedCake {
  id: number;
  layer: number;
  x: number; // left edge in world coordinates (world center = 0)
  y: number; // bottom edge in world coordinates (ground = 0, positive goes UP)
  width: number;
  height: number;
  flavor: CakeFlavor;
  cutLeft: boolean;
  cutRight: boolean;
  landTime: number; // timestamp for squash/bounce settling animation
  isPerfect: boolean;
}

export interface FallingCake {
  id: number;
  layer: number;
  x: number; // center X in world coordinates
  y: number; // bottom Y in world coordinates
  width: number;
  height: number;
  vy: number; // downward velocity (negative in world Y-up coords)
  angle: number; // residual tilt angle from pendulum
  flavor: CakeFlavor;
  missed: boolean; // true once it falls past the target surface
  vx: number;
  angularVelocity: number;
}

export interface SlicedPiece {
  id: number;
  x: number; // center X in world coordinates
  y: number; // bottom Y in world coordinates
  width: number;
  height: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  side: 'left' | 'right'; // which side was trimmed off
  flavor: CakeFlavor;
  opacity: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  kind: 'crumb' | 'sparkle' | 'cream';
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  subtext?: string;
  color: string;
  life: number;
  maxLife: number;
  scale: number;
}

export interface GameHudSnapshot {
  score: number;
  layers: number;
  bestScore: number;
  combo: number;
  maxCombo: number;
  perfectCount: number;
  currentWidthPct: number;
  currentFlavor: CakeFlavor;
  stackedFlavors: { layer: number; flavor: CakeFlavor; isPerfect: boolean; widthPct: number }[];
  isNewRecord: boolean;
}
