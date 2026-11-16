import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CarModel, 
  Obstacle, 
  Coin, 
  PowerUpItem, 
  Particle, 
  SkidMark, 
  ActivePowerUp, 
  EnvironmentTheme, 
  ObstacleType, 
  PowerUpType, 
  GameSettings,
  LevelConfig
} from '../types/game';
import { sound } from '../services/sound';
import { storage } from '../services/storage';

export interface GameLoopStats {
  score: number;
  distanceMeters: number;
  speedKmh: number;
  coinsRun: number;
  totalCoins: number;
  lives: number;
  maxLives: number;
  level: number;
  levelName: string;
  theme: EnvironmentTheme;
  activePowerUps: ActivePowerUp[];
  levelUpAnnouncement: string | null;
}

const LEVEL_THEMES: { name: string; theme: EnvironmentTheme }[] = [
  { name: 'Metro Speedway', theme: 'city' },
  { name: 'Canyon Dunes', theme: 'desert' },
  { name: 'Midnight Monsoon', theme: 'rain' },
  { name: 'Neon Cyberway', theme: 'cyber' },
  { name: 'Alpine Frost', theme: 'snow' },
];

export function useGameEngine(
  selectedCar: CarModel,
  settings: GameSettings,
  onGameOver: (finalScore: number, distance: number, coinsEarned: number) => void
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core gameplay states exposed to React HUD
  const [stats, setStats] = useState<GameLoopStats>({
    score: 0,
    distanceMeters: 0,
    speedKmh: 100,
    coinsRun: 0,
    totalCoins: storage.getCoins(),
    lives: 3,
    maxLives: 3,
    level: 1,
    levelName: LEVEL_THEMES[0].name,
    theme: LEVEL_THEMES[0].theme,
    activePowerUps: [],
    levelUpAnnouncement: null,
  });

  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Mutable Game Loop State in Ref to avoid React state lag during 60+ FPS loop
  const stateRef = useRef({
    isRunning: false,
    isPaused: false,
    score: 0,
    distanceMeters: 0,
    coinsRun: 0,
    lives: 3,
    maxLives: 3,
    level: 1,
    theme: 'city' as EnvironmentTheme,
    levelName: 'Metro Speedway',
    levelUpAnnouncement: null as string | null,
    levelUpTimer: 0,

    // Controls
    targetLane: 1,
    currentLane: 1,
    playerTilt: 0,
    isBoosting: false,
    isBraking: false,
    isOilSliding: false,
    oilSlideTimer: 0,

    // Dimensions
    width: 480,
    height: 720,
    lanesCount: 4,
    roadLeft: 40,
    roadWidth: 400,
    laneWidth: 100,
    playerWidth: 48,
    playerHeight: 88,
    playerX: 200,
    playerY: 560,

    // Movement & Speed
    speedKmh: 120,
    targetSpeedKmh: 120,
    roadScrollY: 0,

    // Damage & Invulnerability
    isInvincible: false,
    invincibleTimer: 0,
    screenShake: { x: 0, y: 0, intensity: 0 },

    // Game Entities
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    powerUps: [] as PowerUpItem[],
    particles: [] as Particle[],
    skidMarks: [] as SkidMark[],
    activePowerUps: [] as ActivePowerUp[],

    // Spawning Timers
    nextSpawnDistance: 80,
    lastObstacleLanes: [] as number[],
    lastTime: performance.now(),
    animationFrameId: 0,
  });

  // Sound & Volume syncing
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
    sound.engineHumEnabled = settings.engineHumEnabled;
    sound.vibrationEnabled = settings.vibrationEnabled;
  }, [settings]);

  // Steer left / right handler
  const steer = useCallback((direction: -1 | 1) => {
    const s = stateRef.current;
    if (!s.isRunning || s.isPaused) return;

    let target = s.targetLane + direction;
    // Invert controls during heavy oil slide
    if (s.isOilSliding && Math.random() > 0.4) {
      target = s.targetLane - direction;
    }
    s.targetLane = Math.max(0, Math.min(s.lanesCount - 1, target));
  }, []);

  const setBoost = useCallback((boosting: boolean) => {
    stateRef.current.isBoosting = boosting;
  }, []);

  const setBrake = useCallback((braking: boolean) => {
    stateRef.current.isBraking = braking;
  }, []);

  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (!s.isRunning) return;
    s.isPaused = !s.isPaused;
    setIsPaused(s.isPaused);
    if (s.isPaused) {
      sound.stopEngine();
    } else {
      s.lastTime = performance.now();
      sound.startEngine();
    }
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        steer(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        steer(1);
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setBoost(true);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setBrake(true);
      } else if (e.key === ' ' || e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        setBoost(false);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        setBrake(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [steer, setBoost, setBrake, togglePause]);

  // Spawn guaranteed-fair obstacles & coins
  const spawnEntities = (distanceAhead: number) => {
    const s = stateRef.current;
    const spawnY = -120;

    // Determine safe lanes (guarantee at least one free lane always!)
    const allLanes = [0, 1, 2, 3];
    const numObstacles = Math.min(2, Math.floor(Math.random() * (s.level > 2 ? 3 : 2)) + 1);
    
    // Pick unique lanes to spawn in
    const shuffledLanes = [...allLanes].sort(() => Math.random() - 0.5);
    const chosenLanes = shuffledLanes.slice(0, numObstacles);
    const freeLanes = allLanes.filter((l) => !chosenLanes.includes(l));

    // 1. Spawn Obstacles
    chosenLanes.forEach((lane) => {
      const laneCenterX = s.roadLeft + (lane + 0.5) * s.laneWidth;
      const rand = Math.random();
      let type: ObstacleType = 'car_sedan';
      let w = 46;
      let h = 84;
      let speed = -25 - Math.random() * 20; // moving relative forward
      let color = '#eab308';

      if (rand < 0.25) {
        type = 'car_truck';
        w = 54;
        h = 135;
        speed = -40; // slower heavy truck
        color = '#3b82f6';
      } else if (rand < 0.45) {
        type = 'car_police';
        w = 46;
        h = 84;
        speed = -15; // fast police
        color = '#000000';
      } else if (rand < 0.65) {
        type = 'car_sport';
        w = 48;
        h = 86;
        speed = -10;
        color = '#ec4899';
      } else if (rand < 0.78) {
        type = 'cone';
        w = 32;
        h = 32;
        speed = 0; // stationary hazard
      } else if (rand < 0.90) {
        type = 'oil';
        w = 48;
        h = 36;
        speed = 0; // oil puddle
      } else {
        type = 'roadblock';
        w = 64;
        h = 38;
        speed = 0; // road barrier
      }

      s.obstacles.push({
        id: Math.random(),
        type,
        lane,
        x: laneCenterX,
        y: spawnY,
        width: w,
        height: h,
        speed,
        color,
        sirenState: 0,
      });
    });

    // 2. Spawn Coins in the remaining safe lanes
    if (freeLanes.length > 0 && Math.random() < 0.75) {
      const coinLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      const coinLaneX = s.roadLeft + (coinLane + 0.5) * s.laneWidth;
      const coinCount = Math.floor(Math.random() * 3) + 3; // line of 3-5 coins

      for (let i = 0; i < coinCount; i++) {
        s.coins.push({
          id: Math.random(),
          lane: coinLane,
          x: coinLaneX,
          y: spawnY - 60 - i * 44,
          radius: 12,
          collected: false,
          angle: (i * Math.PI) / 4,
        });
      }
    }

    // 3. Occasionally spawn Power-Ups in a free lane
    if (Math.random() < 0.22 && freeLanes.length > 0) {
      const pLane = freeLanes[0];
      const pX = s.roadLeft + (pLane + 0.5) * s.laneWidth;
      const pTypes: PowerUpType[] = ['shield', 'magnet', 'nitro', 'double_coins'];
      const pType = pTypes[Math.floor(Math.random() * pTypes.length)];

      s.powerUps.push({
        id: Math.random(),
        type: pType,
        lane: pLane,
        x: pX,
        y: spawnY - 140,
        radius: 18,
        collected: false,
        bobOffset: Math.random() * Math.PI * 2,
      });
    }
  };

  // Start / Restart Game
  const startGame = useCallback(() => {
    const s = stateRef.current;
    s.isRunning = true;
    s.isPaused = false;
    setIsPaused(false);
    s.score = 0;
    s.distanceMeters = 0;
    s.coinsRun = 0;
    s.lives = 3;
    s.maxLives = 3;
    s.level = 1;
    s.theme = LEVEL_THEMES[0].theme;
    s.levelName = LEVEL_THEMES[0].name;
    s.levelUpAnnouncement = null;
    s.levelUpTimer = 0;

    s.targetLane = 1;
    s.currentLane = 1;
    s.playerTilt = 0;
    s.isBoosting = false;
    s.isBraking = false;
    s.isOilSliding = false;
    s.oilSlideTimer = 0;

    s.speedKmh = 130;
    s.targetSpeedKmh = 130;
    s.roadScrollY = 0;

    s.isInvincible = false;
    s.invincibleTimer = 0;
    s.screenShake = { x: 0, y: 0, intensity: 0 };

    s.obstacles = [];
    s.coins = [];
    s.powerUps = [];
    s.particles = [];
    s.skidMarks = [];
    s.activePowerUps = [];

    s.nextSpawnDistance = 60;
    s.lastTime = performance.now();

    sound.startEngine();
    sound.updateEngine(0.3, false, false);
  }, []);

  // Main Game Loop using requestAnimationFrame & delta time
  useEffect(() => {
    let animId = 0;

    const loop = (timestamp: number) => {
      animId = requestAnimationFrame(loop);
      const s = stateRef.current;
      if (!s.isRunning || s.isPaused) return;

      const dt = Math.min((timestamp - s.lastTime) / 1000, 0.08); // delta time clamped
      s.lastTime = timestamp;

      // 1. Calculate Speeds & Boost
      const carMaxSpeed = selectedCar.topSpeedKmh;
      const levelSpeedBonus = (s.level - 1) * 16;
      let baseSpeed = 135 + levelSpeedBonus;

      const hasNitro = s.activePowerUps.some((p) => p.type === 'nitro');

      if (hasNitro) {
        s.targetSpeedKmh = carMaxSpeed + 45;
      } else if (s.isBoosting) {
        s.targetSpeedKmh = Math.min(carMaxSpeed, baseSpeed + 40);
      } else if (s.isBraking) {
        s.targetSpeedKmh = Math.max(70, baseSpeed - 45);
      } else {
        s.targetSpeedKmh = Math.min(carMaxSpeed, baseSpeed);
      }

      // Smooth acceleration / deceleration
      s.speedKmh += (s.targetSpeedKmh - s.speedKmh) * Math.min(1, dt * 5);

      // Sound update
      const speedRatio = (s.speedKmh - 70) / (carMaxSpeed + 45 - 70);
      sound.updateEngine(speedRatio, s.isBoosting || hasNitro, s.isBraking);

      // 2. Distance & Scroll
      const metersPerSec = (s.speedKmh * 1000) / 3600;
      const deltaDistance = metersPerSec * dt;
      s.distanceMeters += deltaDistance;
      s.score += Math.round(deltaDistance * 1.5 * (s.speedKmh / 100));

      const scrollPixels = (s.speedKmh * 4.5) * dt;
      s.roadScrollY += scrollPixels;

      // 3. Level Progression (every 500 meters)
      const currentLevelCalculated = Math.floor(s.distanceMeters / 500) + 1;
      if (currentLevelCalculated > s.level) {
        s.level = currentLevelCalculated;
        const themeIndex = (s.level - 1) % LEVEL_THEMES.length;
        s.theme = LEVEL_THEMES[themeIndex].theme;
        s.levelName = LEVEL_THEMES[themeIndex].name;
        s.levelUpAnnouncement = `STAGE ${s.level} · ${s.levelName.toUpperCase()}`;
        s.levelUpTimer = 2.5;
        sound.playLevelUp();
      }

      if (s.levelUpTimer > 0) {
        s.levelUpTimer -= dt;
        if (s.levelUpTimer <= 0) {
          s.levelUpAnnouncement = null;
        }
      }

      // 4. Player Lane Transition Physics & Steering Tilt
      const handlingSpeed = (selectedCar.handling || 6) * 1.6;
      const laneDiff = s.targetLane - s.currentLane;
      s.currentLane += laneDiff * Math.min(1, dt * handlingSpeed);

      // Steering tilt
      const targetTilt = laneDiff * 14;
      s.playerTilt += (targetTilt - s.playerTilt) * Math.min(1, dt * 10);

      // Oil slide countdown & recovery
      if (s.isOilSliding) {
        s.oilSlideTimer -= dt;
        if (s.oilSlideTimer <= 0) {
          s.isOilSliding = false;
        }
      }

      // Calculate Player position in pixels
      const laneCenterX = s.roadLeft + (s.currentLane + 0.5) * s.laneWidth;
      s.playerX = laneCenterX;
      s.playerY = s.height - 110;

      // 5. Active Power-ups Countdown
      s.activePowerUps = s.activePowerUps
        .map((p) => ({ ...p, durationMs: p.durationMs - dt * 1000 }))
        .filter((p) => p.durationMs > 0);

      // 6. Invincibility Countdown
      if (s.isInvincible) {
        s.invincibleTimer -= dt;
        if (s.invincibleTimer <= 0) {
          s.isInvincible = false;
        }
      }

      // 7. Screen Shake decay
      if (s.screenShake.intensity > 0) {
        s.screenShake.intensity = Math.max(0, s.screenShake.intensity - dt * 25);
        s.screenShake.x = (Math.random() * 2 - 1) * s.screenShake.intensity;
        s.screenShake.y = (Math.random() * 2 - 1) * s.screenShake.intensity;
      } else {
        s.screenShake.x = 0;
        s.screenShake.y = 0;
      }

      // 8. Spawning Waves of Obstacles & Coins
      if (s.distanceMeters >= s.nextSpawnDistance) {
        spawnEntities(s.distanceMeters);
        const spawnGap = Math.max(65, 120 - s.level * 6);
        s.nextSpawnDistance = s.distanceMeters + spawnGap;
      }

      // 9. Update Obstacles
      for (let i = s.obstacles.length - 1; i >= 0; i--) {
        const obs = s.obstacles[i];
        // Move relative to player's scroll speed
        const relSpeed = (s.speedKmh + obs.speed) * 4.5 * dt;
        obs.y += relSpeed;

        // Police siren flash update
        if (obs.type === 'car_police') {
          obs.sirenState = Math.floor(timestamp / 120);
        }

        // Remove if off screen bottom
        if (obs.y > s.height + 150) {
          s.obstacles.splice(i, 1);
          continue;
        }

        // Collision Check with Player Car
        const pBox = {
          left: s.playerX - s.playerWidth * 0.38,
          right: s.playerX + s.playerWidth * 0.38,
          top: s.playerY - s.playerHeight * 0.42,
          bottom: s.playerY + s.playerHeight * 0.42,
        };

        const oBox = {
          left: obs.x - obs.width * 0.42,
          right: obs.x + obs.width * 0.42,
          top: obs.y - obs.height * 0.42,
          bottom: obs.y + obs.height * 0.42,
        };

        const isColliding = 
          pBox.left < oBox.right &&
          pBox.right > oBox.left &&
          pBox.top < oBox.bottom &&
          pBox.bottom > oBox.top;

        if (isColliding) {
          if (obs.type === 'oil') {
            // Oil spill triggers slide
            s.isOilSliding = true;
            s.oilSlideTimer = 1.3;
            sound.playOilSlide();
            // Create skid marks
            s.skidMarks.push({
              x: s.playerX,
              y: s.playerY,
              width: 32,
              alpha: 0.7,
            });
            s.obstacles.splice(i, 1);
            continue;
          }

          // Hard Obstacle / Enemy Car collision
          if (hasNitro) {
            // Nitro destroys obstacles without damage!
            sound.playCrash();
            s.obstacles.splice(i, 1);
            // Spawn debris
            for (let d = 0; d < 8; d++) {
              s.particles.push({
                x: obs.x,
                y: obs.y,
                vx: (Math.random() - 0.5) * 160,
                vy: (Math.random() - 0.5) * 160,
                color: obs.color || '#facc15',
                alpha: 1,
                size: 3 + Math.random() * 4,
                maxLife: 0.6,
                life: 0.6,
                type: 'debris',
              });
            }
            continue;
          }

          if (s.isInvincible) {
            // Invulnerable, push obstacle away
            obs.y += 40;
            continue;
          }

          // Check if player has Shield power-up
          const shieldIdx = s.activePowerUps.findIndex((p) => p.type === 'shield');
          if (shieldIdx >= 0) {
            // Shield absorbs crash!
            s.activePowerUps.splice(shieldIdx, 1);
            sound.playShieldBreak();
            s.screenShake.intensity = 8;
            s.isInvincible = true;
            s.invincibleTimer = 0.9;
            s.obstacles.splice(i, 1);
            continue;
          }

          // Regular Crash - Lose 1 Life
          s.lives -= 1;
          sound.playCrash();
          s.screenShake.intensity = 15;
          s.isInvincible = true;
          s.invincibleTimer = 1.8;

          // Crash smoke and debris
          for (let p = 0; p < 14; p++) {
            s.particles.push({
              x: s.playerX + (Math.random() - 0.5) * 20,
              y: s.playerY + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              color: Math.random() > 0.5 ? selectedCar.colors.primary : '#ffffff',
              alpha: 1,
              size: 4 + Math.random() * 5,
              maxLife: 0.7,
              life: 0.7,
              type: 'debris',
            });
          }

          // Check for Game Over
          if (s.lives <= 0) {
            s.isRunning = false;
            sound.stopEngine();
            storage.addCoins(s.coinsRun);
            onGameOver(s.score, Math.round(s.distanceMeters), s.coinsRun);
            return;
          }
        }
      }

      // 10. Update Coins
      const hasMagnet = s.activePowerUps.some((p) => p.type === 'magnet');
      const hasDoubleCoins = s.activePowerUps.some((p) => p.type === 'double_coins');

      for (let i = s.coins.length - 1; i >= 0; i--) {
        const coin = s.coins[i];
        coin.y += scrollPixels;
        coin.angle += dt * 4;

        // Magnet attraction toward player
        if (hasMagnet && !coin.collected) {
          const dx = s.playerX - coin.x;
          const dy = s.playerY - coin.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 260) {
            coin.x += (dx / dist) * 380 * dt;
            coin.y += (dy / dist) * 380 * dt;
          }
        }

        // Coin Pickup collision
        if (!coin.collected && Math.hypot(s.playerX - coin.x, s.playerY - coin.y) < 38) {
          coin.collected = true;
          const earned = hasDoubleCoins ? 2 : 1;
          s.coinsRun += earned;
          s.score += earned * 50;
          sound.playCoin();

          // Sparkle burst
          for (let sp = 0; sp < 4; sp++) {
            s.particles.push({
              x: coin.x,
              y: coin.y,
              vx: (Math.random() - 0.5) * 100,
              vy: (Math.random() - 0.5) * 100,
              color: '#facc15',
              alpha: 1,
              size: 3,
              maxLife: 0.4,
              life: 0.4,
              type: 'spark',
            });
          }
        }

        // Remove offscreen
        if (coin.y > s.height + 60 || coin.collected) {
          s.coins.splice(i, 1);
        }
      }

      // 11. Update Power-Up Items
      for (let i = s.powerUps.length - 1; i >= 0; i--) {
        const pu = s.powerUps[i];
        pu.y += scrollPixels;
        pu.bobOffset += dt * 4;

        if (!pu.collected && Math.hypot(s.playerX - pu.x, s.playerY - pu.y) < 42) {
          pu.collected = true;
          sound.playPowerUp();

          // Add active power-up timer
          const duration = pu.type === 'nitro' ? 4000 : 8000;
          const existing = s.activePowerUps.find((p) => p.type === pu.type);
          if (existing) {
            existing.durationMs = duration;
          } else {
            s.activePowerUps.push({
              type: pu.type,
              durationMs: duration,
              maxDurationMs: duration,
            });
          }

          if (pu.type === 'nitro') {
            sound.playNitro();
          }

          s.powerUps.splice(i, 1);
          continue;
        }

        if (pu.y > s.height + 60) {
          s.powerUps.splice(i, 1);
        }
      }

      // 12. Particles & Skid marks updates
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha = Math.max(0, p.life / p.maxLife);
        if (p.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // Ambient weather particles
      if (settings.graphicsQuality === 'high') {
        if (s.theme === 'rain' && Math.random() < 0.6) {
          s.particles.push({
            x: Math.random() * s.width,
            y: -10,
            vx: -30,
            vy: 600 + Math.random() * 200,
            color: 'rgba(186, 230, 253, 0.75)',
            alpha: 0.8,
            size: 14,
            maxLife: 1.2,
            life: 1.2,
            type: 'rain',
          });
        } else if (s.theme === 'snow' && Math.random() < 0.4) {
          s.particles.push({
            x: Math.random() * s.width,
            y: -10,
            vx: (Math.random() - 0.5) * 40,
            vy: 140 + Math.random() * 80,
            color: '#ffffff',
            alpha: 0.9,
            size: 2.5,
            maxLife: 3,
            life: 3,
            type: 'snow',
          });
        }
      }

      // Skid marks fade
      for (let i = s.skidMarks.length - 1; i >= 0; i--) {
        const sm = s.skidMarks[i];
        sm.y += scrollPixels;
        sm.alpha -= dt * 0.3;
        if (sm.alpha <= 0 || sm.y > s.height + 60) {
          s.skidMarks.splice(i, 1);
        }
      }

      // 13. Throttle state updates to React HUD (~15fps for UI smooth telemetry)
      if (Math.random() < 0.25) {
        setStats({
          score: s.score,
          distanceMeters: Math.round(s.distanceMeters),
          speedKmh: Math.round(s.speedKmh),
          coinsRun: s.coinsRun,
          totalCoins: storage.getCoins() + s.coinsRun,
          lives: s.lives,
          maxLives: s.maxLives,
          level: s.level,
          levelName: s.levelName,
          theme: s.theme,
          activePowerUps: [...s.activePowerUps],
          levelUpAnnouncement: s.levelUpAnnouncement,
        });
      }
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [selectedCar, settings.graphicsQuality, onGameOver]);

  return {
    canvasRef,
    stateRef,
    stats,
    isPaused,
    startGame,
    togglePause,
    steer,
    setBoost,
    setBrake,
  };
}
