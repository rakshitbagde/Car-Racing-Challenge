export type GameState = 
  | 'HOME' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'GAMEOVER' 
  | 'GARAGE' 
  | 'LEADERBOARD' 
  | 'SETTINGS';

export type EnvironmentTheme = 'city' | 'desert' | 'rain' | 'cyber' | 'snow';

export type ControlType = 'touch_half' | 'buttons' | 'swipe';

export interface GameSettings {
  controlType: ControlType;
  soundEnabled: boolean;
  soundVolume: number;
  engineHumEnabled: boolean;
  vibrationEnabled: boolean;
  graphicsQuality: 'low' | 'high';
}

export interface CarModel {
  id: string;
  name: string;
  price: number;
  topSpeedKmh: number;
  handling: number; // 1-10
  shieldArmor: number; // 1-10 (affects invincibility duration & shield strength)
  tagline: string;
  bodyStyle: 'sports' | 'muscle' | 'buggy' | 'supercar' | 'truck' | 'hyper' | 'armored';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    glow: string;
    windshield: string;
  };
}

export type ObstacleType = 
  | 'car_sedan' 
  | 'car_truck' 
  | 'car_sport' 
  | 'car_police' 
  | 'cone' 
  | 'oil' 
  | 'roadblock';

export type PowerUpType = 
  | 'shield' 
  | 'magnet' 
  | 'nitro' 
  | 'double_coins';

export interface ActivePowerUp {
  type: PowerUpType;
  durationMs: number;
  maxDurationMs: number;
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  lane: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number; // relative forward or backward speed
  color?: string;
  secondaryColor?: string;
  sirenState?: number;
}

export interface Coin {
  id: number;
  lane: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  angle: number; // for 3D spinning effect
}

export interface PowerUpItem {
  id: number;
  type: PowerUpType;
  lane: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  bobOffset: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  maxLife: number;
  life: number;
  type?: 'smoke' | 'spark' | 'flame' | 'rain' | 'snow' | 'confetti' | 'debris';
}

export interface SkidMark {
  x: number;
  y: number;
  width: number;
  alpha: number;
}

export interface HighScoreRecord {
  id: string;
  score: number;
  distance: number;
  coins: number;
  date: string;
  carId: string;
  carName: string;
}

export interface LevelConfig {
  level: number;
  name: string;
  theme: EnvironmentTheme;
  roadColor: string;
  shoulderColor: string;
  lineColor: string;
  curbColorA: string;
  curbColorB: string;
  skyTint: string;
  baseSpeed: number;
  obstacleSpawnRate: number;
}
