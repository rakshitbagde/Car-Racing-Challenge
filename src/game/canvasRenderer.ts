import { 
  CarModel, 
  Obstacle, 
  Coin, 
  PowerUpItem, 
  Particle, 
  SkidMark, 
  ActivePowerUp, 
  EnvironmentTheme 
} from '../types/game';

export interface RenderState {
  playerX: number;
  playerY: number;
  playerWidth: number;
  playerHeight: number;
  playerTilt: number;
  selectedCar: CarModel;
  speedKmh: number;
  distanceMeters: number;
  roadScrollY: number;
  lanesCount: number;
  roadWidth: number;
  roadLeft: number;
  laneWidth: number;
  theme: EnvironmentTheme;
  obstacles: Obstacle[];
  coins: Coin[];
  powerUps: PowerUpItem[];
  particles: Particle[];
  skidMarks: SkidMark[];
  activePowerUps: ActivePowerUp[];
  isInvincible: boolean;
  invincibleBlink: number;
  isOilSliding: boolean;
  isBraking: boolean;
  isBoosting: boolean;
  screenShake: { x: number; y: number };
  graphicsQuality: 'low' | 'high';
}

export class CanvasRenderer {
  // Main draw method
  public static renderGame(ctx: CanvasRenderingContext2D, width: number, height: number, state: RenderState) {
    ctx.save();
    
    // Apply camera screen shake
    ctx.translate(state.screenShake.x, state.screenShake.y);

    // 1. Draw Environment & Road Background
    this.drawEnvironment(ctx, width, height, state);

    // 2. Draw Skid Marks
    this.drawSkidMarks(ctx, state.skidMarks);

    // 3. Draw Coins
    this.drawCoins(ctx, state.coins);

    // 4. Draw Power-Up items on the road
    this.drawPowerUps(ctx, state.powerUps);

    // 5. Draw Obstacles (Enemies, Cones, Oil, Roadblocks)
    this.drawObstacles(ctx, state);

    // 6. Draw Player Car
    this.drawPlayerCar(ctx, state);

    // 7. Draw Ambient Weather Particles (Rain / Snow / Sand)
    this.drawParticles(ctx, state.particles);

    // 8. Draw Headlights & Ambient Lighting (especially for Rainy Night & Cyberpunk)
    this.drawLightingPass(ctx, width, height, state);

    ctx.restore();
  }

  // Draw Environment & Road
  private static drawEnvironment(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    state: RenderState
  ) {
    const { roadLeft, roadWidth, theme, roadScrollY, lanesCount, laneWidth } = state;
    const roadRight = roadLeft + roadWidth;

    // Grass / Ground on left and right sides
    let groundColor = '#1e293b';
    let roadColor = '#1c1f26';
    let curbColorA = '#ef4444';
    let curbColorB = '#ffffff';

    if (theme === 'city') {
      groundColor = '#0f172a';
      roadColor = '#1e222d';
      curbColorA = '#facc15';
      curbColorB = '#0f172a';
    } else if (theme === 'desert') {
      groundColor = '#78350f';
      roadColor = '#292524';
      curbColorA = '#f97316';
      curbColorB = '#fef08a';
    } else if (theme === 'rain') {
      groundColor = '#090d16';
      roadColor = '#11151f';
      curbColorA = '#0284c7';
      curbColorB = '#f8fafc';
    } else if (theme === 'cyber') {
      groundColor = '#050510';
      roadColor = '#0d0f1a';
      curbColorA = '#06b6d4';
      curbColorB = '#d946ef';
    } else if (theme === 'snow') {
      groundColor = '#cbd5e1';
      roadColor = '#334155';
      curbColorA = '#38bdf8';
      curbColorB = '#ffffff';
    }

    // Fill off-road shoulder areas
    ctx.fillStyle = groundColor;
    ctx.fillRect(0, 0, width, height);

    // Draw roadside texture stripes / scenery details
    const stripeSpacing = 60;
    const offset = roadScrollY % stripeSpacing;

    // Roadside barriers/guardrails
    ctx.fillStyle = theme === 'cyber' ? '#1e1b4b' : 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(roadLeft - 24, 0, 24, height);
    ctx.fillRect(roadRight, 0, 24, height);

    // Animated curbs
    const curbHeight = 40;
    const curbOffset = roadScrollY % (curbHeight * 2);

    for (let y = -curbHeight * 2; y < height + curbHeight * 2; y += curbHeight) {
      const isA = Math.floor((y - curbOffset) / curbHeight) % 2 === 0;
      ctx.fillStyle = isA ? curbColorA : curbColorB;
      // Left curb
      ctx.fillRect(roadLeft - 8, y + curbOffset, 8, curbHeight);
      // Right curb
      ctx.fillRect(roadRight, y + curbOffset, 8, curbHeight);
    }

    // Asphalt Road surface
    ctx.fillStyle = roadColor;
    ctx.fillRect(roadLeft, 0, roadWidth, height);

    // Wet asphalt reflections in rain mode
    if (theme === 'rain') {
      const grad = ctx.createLinearGradient(roadLeft, 0, roadRight, 0);
      grad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.8)');
      grad.addColorStop(1, 'rgba(30, 41, 59, 0.4)');
      ctx.fillStyle = grad;
      ctx.fillRect(roadLeft, 0, roadWidth, height);
    }

    // Lane Divider Lines
    const dashLength = 36;
    const dashGap = 34;
    const totalDash = dashLength + dashGap;
    const dashOffset = roadScrollY % totalDash;

    ctx.lineWidth = 4;
    ctx.strokeStyle = theme === 'cyber' ? '#22d3ee' : '#f8fafc';
    if (theme === 'cyber') {
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowBlur = 0;
    }

    ctx.setLineDash([dashLength, dashGap]);
    ctx.lineDashOffset = -dashOffset;

    for (let i = 1; i < lanesCount; i++) {
      const laneX = roadLeft + i * laneWidth;
      ctx.beginPath();
      ctx.moveTo(laneX, -totalDash);
      ctx.lineTo(laneX, height + totalDash);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.shadowBlur = 0;

    // Solid outer shoulder lines
    ctx.lineWidth = 3;
    ctx.strokeStyle = theme === 'cyber' ? '#f43f5e' : 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.moveTo(roadLeft + 2, 0);
    ctx.lineTo(roadLeft + 2, height);
    ctx.moveTo(roadRight - 2, 0);
    ctx.lineTo(roadRight - 2, height);
    ctx.stroke();
  }

  // Draw Skid Marks
  private static drawSkidMarks(ctx: CanvasRenderingContext2D, marks: SkidMark[]) {
    marks.forEach((mark) => {
      ctx.fillStyle = `rgba(0, 0, 0, ${mark.alpha})`;
      ctx.fillRect(mark.x - mark.width / 2, mark.y, mark.width, 10);
    });
  }

  // Draw Coins
  private static drawCoins(ctx: CanvasRenderingContext2D, coins: Coin[]) {
    coins.forEach((coin) => {
      if (coin.collected) return;
      ctx.save();
      ctx.translate(coin.x, coin.y);

      // 3D spinning scaling on X
      const scaleX = Math.cos(coin.angle);
      ctx.scale(Math.max(0.15, Math.abs(scaleX)), 1);

      // Outer gold glow
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 10;

      // Outer coin rim
      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner coin face
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius * 0.78, 0, Math.PI * 2);
      ctx.fill();

      // Coin star/dollar emboss
      ctx.fillStyle = '#713f12';
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();

      // Edge reflection highlight
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, coin.radius * 0.85, -Math.PI * 0.4, Math.PI * 0.1);
      ctx.stroke();

      ctx.restore();
    });
  }

  // Draw Power-Up Capsules
  private static drawPowerUps(ctx: CanvasRenderingContext2D, items: PowerUpItem[]) {
    items.forEach((item) => {
      if (item.collected) return;
      ctx.save();
      ctx.translate(item.x, item.y + Math.sin(item.bobOffset) * 4);

      let colorPrimary = '#06b6d4';
      let icon = '⚡';

      if (item.type === 'shield') {
        colorPrimary = '#38bdf8';
        icon = '🛡️';
      } else if (item.type === 'magnet') {
        colorPrimary = '#ef4444';
        icon = '🧲';
      } else if (item.type === 'nitro') {
        colorPrimary = '#10b981';
        icon = '🚀';
      } else if (item.type === 'double_coins') {
        colorPrimary = '#eab308';
        icon = '2X';
      }

      // Outer pulse halo
      ctx.shadowColor = colorPrimary;
      ctx.shadowBlur = 16;
      ctx.strokeStyle = colorPrimary;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius + 3, 0, Math.PI * 2);
      ctx.stroke();

      // Inner orb background
      const grad = ctx.createRadialGradient(-3, -3, 2, 0, 0, item.radius);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, colorPrimary);
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();

      // Label / icon
      ctx.shadowBlur = 0;
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (item.type === 'double_coins') {
        ctx.fillStyle = '#ffffff';
        ctx.fillText('2X', 0, 1);
      } else {
        ctx.fillText(icon, 0, 1);
      }

      ctx.restore();
    });
  }

  // Draw Obstacles
  private static drawObstacles(ctx: CanvasRenderingContext2D, state: RenderState) {
    state.obstacles.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      switch (obs.type) {
        case 'cone':
          this.drawTrafficCone(ctx, obs.width, obs.height);
          break;
        case 'oil':
          this.drawOilSpill(ctx, obs.width, obs.height);
          break;
        case 'roadblock':
          this.drawRoadblock(ctx, obs.width, obs.height);
          break;
        case 'car_truck':
          this.drawEnemyTruck(ctx, obs.width, obs.height, obs.color || '#3b82f6');
          break;
        case 'car_police':
          this.drawPoliceCar(ctx, obs.width, obs.height, obs.sirenState || 0);
          break;
        case 'car_sport':
          this.drawEnemySedan(ctx, obs.width, obs.height, obs.color || '#ec4899', true);
          break;
        case 'car_sedan':
        default:
          this.drawEnemySedan(ctx, obs.width, obs.height, obs.color || '#eab308', false);
          break;
      }

      ctx.restore();
    });
  }

  // Traffic Cone
  private static drawTrafficCone(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, h * 0.35, w * 0.5, h * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Square base
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-w * 0.42, -h * 0.2, w * 0.84, h * 0.4);

    // Orange cone
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.45);
    ctx.lineTo(w * 0.36, h * 0.2);
    ctx.lineTo(-w * 0.36, h * 0.2);
    ctx.closePath();
    ctx.fill();

    // White reflective band
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-w * 0.18, -h * 0.05);
    ctx.lineTo(w * 0.18, -h * 0.05);
    ctx.lineTo(w * 0.26, h * 0.08);
    ctx.lineTo(-w * 0.26, h * 0.08);
    ctx.closePath();
    ctx.fill();

    // Black tip
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.45);
    ctx.lineTo(w * 0.09, -h * 0.3);
    ctx.lineTo(-w * 0.09, -h * 0.3);
    ctx.closePath();
    ctx.fill();
  }

  // Oil Spill Puddle
  private static drawOilSpill(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    // Dark iridescent blob
    const grad = ctx.createRadialGradient(0, 0, 3, 0, 0, w * 0.48);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(0.5, '#18181b');
    grad.addColorStop(0.8, 'rgba(39, 39, 42, 0.85)');
    grad.addColorStop(1, 'rgba(9, 9, 11, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.46, h * 0.42, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Rainbow sheen
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(-2, -2, w * 0.3, h * 0.25, -0.15, 0, Math.PI * 1.5);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(3, 3, w * 0.2, h * 0.18, 0.3, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // Roadblock Construction Barrier
  private static drawRoadblock(ctx: CanvasRenderingContext2D, w: number, h: number) {
    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(-w * 0.48, h * 0.2, w * 0.96, h * 0.25);

    // Concrete base stands
    ctx.fillStyle = '#52525b';
    ctx.fillRect(-w * 0.45, -h * 0.35, w * 0.15, h * 0.7);
    ctx.fillRect(w * 0.3, -h * 0.35, w * 0.15, h * 0.7);

    // Striped hazard beam
    ctx.save();
    ctx.beginPath();
    ctx.rect(-w * 0.46, -h * 0.25, w * 0.92, h * 0.5);
    ctx.clip();

    ctx.fillStyle = '#facc15'; // Yellow
    ctx.fillRect(-w * 0.46, -h * 0.25, w * 0.92, h * 0.5);

    // Black diagonal chevrons
    ctx.fillStyle = '#18181b';
    const stripeW = 14;
    for (let x = -w * 0.6; x < w * 0.6; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, -h * 0.3);
      ctx.lineTo(x + stripeW, -h * 0.3);
      ctx.lineTo(x + stripeW - 10, h * 0.3);
      ctx.lineTo(x - 10, h * 0.3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Hazard flashers on top
    const now = performance.now();
    const flash = Math.floor(now / 200) % 2 === 0;
    ctx.fillStyle = flash ? '#f97316' : '#7c2d12';
    ctx.beginPath();
    ctx.arc(-w * 0.3, -h * 0.38, 4, 0, Math.PI * 2);
    ctx.arc(w * 0.3, -h * 0.38, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Enemy Sedan / Sports Car
  private static drawEnemySedan(
    ctx: CanvasRenderingContext2D, 
    w: number, 
    h: number, 
    color: string, 
    isSport: boolean
  ) {
    const hw = w / 2;
    const hh = h / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    this.roundRect(ctx, -hw - 3, -hh + 4, w + 6, h + 2, 8);
    ctx.fill();

    // Tires
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-hw - 3, -hh + 12, 5, 14);
    ctx.fillRect(hw - 2, -hh + 12, 5, 14);
    ctx.fillRect(-hw - 3, hh - 24, 5, 14);
    ctx.fillRect(hw - 2, hh - 24, 5, 14);

    // Car Body
    ctx.fillStyle = color;
    this.roundRect(ctx, -hw, -hh, w, h, isSport ? 12 : 8);
    ctx.fill();

    // Roof & Cabin
    ctx.fillStyle = '#0f172a';
    this.roundRect(ctx, -hw + 4, -hh + 18, w - 8, h * 0.5, 6);
    ctx.fill();

    // Windshield (Front and rear)
    ctx.fillStyle = '#38bdf8';
    // Front windshield
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -hh + 20);
    ctx.lineTo(hw - 6, -hh + 20);
    ctx.lineTo(hw - 8, -hh + 32);
    ctx.lineTo(-hw + 8, -hh + 32);
    ctx.closePath();
    ctx.fill();

    // Rear window
    ctx.beginPath();
    ctx.moveTo(-hw + 7, hh - 22);
    ctx.lineTo(hw - 7, hh - 22);
    ctx.lineTo(hw - 6, hh - 12);
    ctx.lineTo(-hw + 6, hh - 12);
    ctx.closePath();
    ctx.fill();

    // Front headlights
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-hw + 3, -hh, 7, 3);
    ctx.fillRect(hw - 10, -hh, 7, 3);

    // Red taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-hw + 3, hh - 3, 7, 3);
    ctx.fillRect(hw - 10, hh - 3, 7, 3);
  }

  // Enemy Heavy Truck (18-wheeler style)
  private static drawEnemyTruck(ctx: CanvasRenderingContext2D, w: number, h: number, cabColor: string) {
    const hw = w / 2;
    const hh = h / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.roundRect(ctx, -hw - 4, -hh + 4, w + 8, h + 4, 6);
    ctx.fill();

    // Double axle tires
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-hw - 4, -hh + 14, 6, 16);
    ctx.fillRect(hw - 2, -hh + 14, 6, 16);
    ctx.fillRect(-hw - 4, hh - 38, 6, 14);
    ctx.fillRect(hw - 2, hh - 38, 6, 14);
    ctx.fillRect(-hw - 4, hh - 20, 6, 14);
    ctx.fillRect(hw - 2, hh - 20, 6, 14);

    // Cargo Trailer Body (White / Silver with ribs)
    ctx.fillStyle = '#e2e8f0';
    this.roundRect(ctx, -hw, -hh + 32, w, h - 34, 4);
    ctx.fill();

    // Cargo ribs
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    for (let y = -hh + 46; y < hh - 12; y += 18) {
      ctx.beginPath();
      ctx.moveTo(-hw + 3, y);
      ctx.lineTo(hw - 3, y);
      ctx.stroke();
    }

    // Cab (Front)
    ctx.fillStyle = cabColor;
    this.roundRect(ctx, -hw + 2, -hh, w - 4, 34, 6);
    ctx.fill();

    // Cab windshield
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-hw + 6, -hh + 8, w - 12, 10);

    // Roof marker lights
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-hw + 6, -hh + 1, 4, 3);
    ctx.fillRect(-2, -hh + 1, 4, 3);
    ctx.fillRect(hw - 10, -hh + 1, 4, 3);

    // Front Headlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-hw + 4, -hh, 6, 3);
    ctx.fillRect(hw - 10, -hh, 6, 3);

    // Rear trailer red taillights
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-hw + 2, hh - 4, 8, 4);
    ctx.fillRect(hw - 10, hh - 4, 8, 4);
  }

  // Police Interceptor Car with flashing strobe lightbar
  private static drawPoliceCar(ctx: CanvasRenderingContext2D, w: number, h: number, sirenState: number) {
    const hw = w / 2;
    const hh = h / 2;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    this.roundRect(ctx, -hw - 3, -hh + 4, w + 6, h + 2, 8);
    ctx.fill();

    // Tires
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-hw - 3, -hh + 12, 5, 14);
    ctx.fillRect(hw - 2, -hh + 12, 5, 14);
    ctx.fillRect(-hw - 3, hh - 24, 5, 14);
    ctx.fillRect(hw - 2, hh - 24, 5, 14);

    // Body (Black and White cruiser)
    ctx.fillStyle = '#09090b';
    this.roundRect(ctx, -hw, -hh, w, h, 8);
    ctx.fill();

    // White door panel section
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-hw + 1, -hh + 16, w - 2, h * 0.44);

    // Roof & Windows
    ctx.fillStyle = '#18181b';
    this.roundRect(ctx, -hw + 4, -hh + 18, w - 8, h * 0.45, 6);
    ctx.fill();

    // Windshield
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-hw + 6, -hh + 20);
    ctx.lineTo(hw - 6, -hh + 20);
    ctx.lineTo(hw - 8, -hh + 30);
    ctx.lineTo(-hw + 8, -hh + 30);
    ctx.closePath();
    ctx.fill();

    // Flashing Police Lightbar
    const isRedActive = sirenState % 2 === 0;
    // Left blue, Right red
    ctx.fillStyle = isRedActive ? '#3b82f6' : '#1d4ed8';
    ctx.fillRect(-hw + 6, -hh + 34, hw - 8, 6);
    ctx.fillStyle = !isRedActive ? '#ef4444' : '#991b1b';
    ctx.fillRect(2, -hh + 34, hw - 8, 6);

    // Light glow
    ctx.fillStyle = isRedActive ? 'rgba(59, 130, 246, 0.6)' : 'rgba(239, 68, 68, 0.6)';
    ctx.beginPath();
    ctx.arc(isRedActive ? -hw + 12 : hw - 12, -hh + 37, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Player Car
  private static drawPlayerCar(ctx: CanvasRenderingContext2D, state: RenderState) {
    const { 
      playerX, 
      playerY, 
      playerWidth, 
      playerHeight, 
      playerTilt, 
      selectedCar, 
      isInvincible, 
      invincibleBlink, 
      isOilSliding, 
      isBoosting, 
      isBraking, 
      activePowerUps 
    } = state;

    ctx.save();
    ctx.translate(playerX, playerY);

    // Dynamic tilt from steering + oil skid rotation
    let totalAngle = (playerTilt * Math.PI) / 180;
    if (isOilSliding) {
      totalAngle += Math.sin(performance.now() * 0.02) * 0.25;
    }
    ctx.rotate(totalAngle);

    // Invincibility blink
    if (isInvincible && Math.sin(invincibleBlink * 15) > 0) {
      ctx.globalAlpha = 0.45;
    }

    const hw = playerWidth / 2;
    const hh = playerHeight / 2;

    // 1. Soft Dynamic Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    this.roundRect(ctx, -hw - 4, -hh + 8, playerWidth + 8, playerHeight, 10);
    ctx.fill();

    // 2. Wheels / Alloy Rims
    ctx.fillStyle = '#18181b';
    // Front tires
    ctx.fillRect(-hw - 4, -hh + 14, 6, 16);
    ctx.fillRect(hw - 2, -hh + 14, 6, 16);
    // Rear tires
    ctx.fillRect(-hw - 4, hh - 26, 6, 16);
    ctx.fillRect(hw - 2, hh - 26, 6, 16);

    // Rims
    ctx.fillStyle = selectedCar.colors.accent;
    ctx.fillRect(-hw - 3, -hh + 18, 4, 8);
    ctx.fillRect(hw - 1, -hh + 18, 4, 8);
    ctx.fillRect(-hw - 3, hh - 22, 4, 8);
    ctx.fillRect(hw - 1, hh - 22, 4, 8);

    // 3. Main Car Body
    this.drawCarBody(ctx, hw, hh, selectedCar);

    // 4. Taillights & Brake glow
    ctx.fillStyle = isBraking ? '#ff0033' : '#dc2626';
    if (isBraking) {
      ctx.shadowColor = '#ff0033';
      ctx.shadowBlur = 14;
    }
    ctx.fillRect(-hw + 4, hh - 4, 8, 4);
    ctx.fillRect(hw - 12, hh - 4, 8, 4);
    ctx.shadowBlur = 0;

    // 5. Headlight Lenses
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-hw + 4, -hh, 8, 4);
    ctx.fillRect(hw - 12, -hh, 8, 4);

    // 6. Nitro Exhaust Thrust Flames
    const hasNitroPowerUp = activePowerUps.some((p) => p.type === 'nitro');
    if (isBoosting || hasNitroPowerUp) {
      this.drawNitroThrust(ctx, hw, hh, hasNitroPowerUp);
    }

    // 7. Shield Forcefield Bubble
    const hasShield = activePowerUps.some((p) => p.type === 'shield');
    if (hasShield) {
      this.drawShieldBubble(ctx, playerWidth, playerHeight);
    }

    // 8. Magnet Pulse Aura
    const hasMagnet = activePowerUps.some((p) => p.type === 'magnet');
    if (hasMagnet) {
      this.drawMagnetPulse(ctx, playerWidth, playerHeight);
    }

    ctx.restore();
  }

  // Draw Specific Car Model Chassis
  public static drawCarBody(
    ctx: CanvasRenderingContext2D, 
    hw: number, 
    hh: number, 
    car: CarModel
  ) {
    const { primary, secondary, accent, windshield } = car.colors;
    const w = hw * 2;
    const h = hh * 2;

    // Aerodynamic Chassis Gradient
    const bodyGrad = ctx.createLinearGradient(-hw, 0, hw, 0);
    bodyGrad.addColorStop(0, primary);
    bodyGrad.addColorStop(0.5, this.lightenColor(primary, 20));
    bodyGrad.addColorStop(1, primary);

    ctx.fillStyle = bodyGrad;

    if (car.bodyStyle === 'hyper' || car.bodyStyle === 'supercar') {
      // Sleek tapered wedge body
      ctx.beginPath();
      ctx.moveTo(-hw * 0.7, -hh);
      ctx.lineTo(hw * 0.7, -hh);
      ctx.lineTo(hw, -hh * 0.4);
      ctx.lineTo(hw, hh * 0.7);
      ctx.lineTo(hw * 0.85, hh);
      ctx.lineTo(-hw * 0.85, hh);
      ctx.lineTo(-hw, hh * 0.7);
      ctx.lineTo(-hw, -hh * 0.4);
      ctx.closePath();
      ctx.fill();
    } else if (car.bodyStyle === 'armored') {
      // Angular heavy fortress
      ctx.beginPath();
      ctx.moveTo(-hw * 0.8, -hh);
      ctx.lineTo(hw * 0.8, -hh);
      ctx.lineTo(hw, -hh * 0.6);
      ctx.lineTo(hw, hh * 0.9);
      ctx.lineTo(hw * 0.6, hh);
      ctx.lineTo(-hw * 0.6, hh);
      ctx.lineTo(-hw, hh * 0.9);
      ctx.lineTo(-hw, -hh * 0.6);
      ctx.closePath();
      ctx.fill();
    } else {
      // Classic & Muscle sports car
      this.roundRect(ctx, -hw, -hh, w, h, 10);
      ctx.fill();
    }

    // Center Racing Stripe / Livery
    ctx.fillStyle = accent;
    ctx.fillRect(-3, -hh + 4, 6, h - 8);

    // Cabin / Cockpit Roof
    ctx.fillStyle = secondary;
    this.roundRect(ctx, -hw * 0.75, -hh * 0.45, w * 0.75, h * 0.48, 8);
    ctx.fill();

    // Windshield (Curved cyan glass)
    ctx.fillStyle = windshield;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.65, -hh * 0.4);
    ctx.lineTo(hw * 0.65, -hh * 0.4);
    ctx.lineTo(hw * 0.55, -hh * 0.15);
    ctx.lineTo(-hw * 0.55, -hh * 0.15);
    ctx.closePath();
    ctx.fill();

    // Windshield shine reflection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.45, -hh * 0.38);
    ctx.lineTo(-hw * 0.1, -hh * 0.18);
    ctx.stroke();

    // Rear Windshield
    ctx.fillStyle = windshield;
    ctx.beginPath();
    ctx.moveTo(-hw * 0.6, hh * 0.1);
    ctx.lineTo(hw * 0.6, hh * 0.1);
    ctx.lineTo(hw * 0.5, hh * 0.25);
    ctx.lineTo(-hw * 0.5, hh * 0.25);
    ctx.closePath();
    ctx.fill();

    // Rear Aerodynamic Spoiler / Wing
    ctx.fillStyle = accent;
    ctx.fillRect(-hw * 0.88, hh - 8, w * 0.88, 5);
    // Wing endplates
    ctx.fillStyle = primary;
    ctx.fillRect(-hw * 0.92, hh - 10, 4, 9);
    ctx.fillRect(hw * 0.92 - 4, hh - 10, 4, 9);
  }

  // Draw Nitro Exhaust Thrust
  private static drawNitroThrust(
    ctx: CanvasRenderingContext2D, 
    hw: number, 
    hh: number, 
    isHyper: boolean
  ) {
    const flameLen = 20 + Math.random() * 15;
    const flameColor = isHyper ? '#06b6d4' : '#f97316';
    const coreColor = '#ffffff';

    // Left flame
    ctx.fillStyle = flameColor;
    ctx.beginPath();
    ctx.moveTo(-hw + 8, hh);
    ctx.lineTo(-hw + 14, hh);
    ctx.lineTo(-hw + 11, hh + flameLen);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.moveTo(-hw + 9, hh);
    ctx.lineTo(-hw + 13, hh);
    ctx.lineTo(-hw + 11, hh + flameLen * 0.5);
    ctx.closePath();
    ctx.fill();

    // Right flame
    ctx.fillStyle = flameColor;
    ctx.beginPath();
    ctx.moveTo(hw - 14, hh);
    ctx.lineTo(hw - 8, hh);
    ctx.lineTo(hw - 11, hh + flameLen);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = coreColor;
    ctx.beginPath();
    ctx.moveTo(hw - 13, hh);
    ctx.lineTo(hw - 9, hh);
    ctx.lineTo(hw - 11, hh + flameLen * 0.5);
    ctx.closePath();
    ctx.fill();
  }

  // Draw Shield Bubble
  private static drawShieldBubble(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const radius = Math.max(w, h) * 0.65;
    const now = performance.now();
    const pulse = Math.sin(now * 0.008) * 3;

    ctx.save();
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 18;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(0, 0, radius + pulse, 0, Math.PI * 2);
    ctx.stroke();

    // Inner subtle glow
    ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';
    ctx.fill();
    ctx.restore();
  }

  // Draw Magnet Pulse Aura
  private static drawMagnetPulse(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const now = performance.now();
    const pulse = (now % 800) / 800;
    const r = Math.max(w, h) * (0.8 + pulse * 0.7);

    ctx.save();
    ctx.strokeStyle = `rgba(239, 68, 68, ${1 - pulse})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Weather and Visual Particles
  private static drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.type === 'rain') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.size);
        ctx.stroke();
      } else if (p.type === 'confetti') {
        ctx.fillRect(p.x, p.y, p.size, p.size * 1.5);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // Lighting Pass (Headlights cutting through darkness in rain/cyber)
  private static drawLightingPass(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    state: RenderState
  ) {
    const { theme, playerX, playerY, playerWidth, graphicsQuality, obstacles } = state;

    // Only apply heavy ambient lighting on night/rain or cyber themes
    if (theme !== 'rain' && theme !== 'cyber') return;

    ctx.save();

    // Player Headlight Beams
    const beamLength = 260;
    const beamSpread = 45;
    const hw = playerWidth / 2;

    const leftLightX = playerX - hw + 8;
    const rightLightX = playerX + hw - 8;
    const lightY = playerY - 30;

    // Draw headlight light cone
    const grad = ctx.createRadialGradient(playerX, lightY, 20, playerX, lightY - beamLength, beamSpread * 2);
    grad.addColorStop(0, 'rgba(255, 255, 220, 0.35)');
    grad.addColorStop(0.4, 'rgba(255, 255, 200, 0.15)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = grad;

    // Left cone
    ctx.beginPath();
    ctx.moveTo(leftLightX, lightY);
    ctx.lineTo(leftLightX - beamSpread, lightY - beamLength);
    ctx.lineTo(leftLightX + beamSpread, lightY - beamLength);
    ctx.closePath();
    ctx.fill();

    // Right cone
    ctx.beginPath();
    ctx.moveTo(rightLightX, lightY);
    ctx.lineTo(rightLightX - beamSpread, lightY - beamLength);
    ctx.lineTo(rightLightX + beamSpread, lightY - beamLength);
    ctx.closePath();
    ctx.fill();

    // Enemy oncoming headlights (facing player)
    if (graphicsQuality === 'high') {
      obstacles.forEach((obs) => {
        if (obs.type.startsWith('car_')) {
          const eGrad = ctx.createRadialGradient(obs.x, obs.y + obs.height / 2, 10, obs.x, obs.y + obs.height / 2 + 100, 30);
          eGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
          eGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = eGrad;
          ctx.beginPath();
          ctx.arc(obs.x, obs.y + obs.height / 2 + 40, 50, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Ambient dark vignette
    if (theme === 'rain') {
      const darkGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width);
      darkGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      darkGrad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
      ctx.fillStyle = darkGrad;
      ctx.fillRect(0, 0, width, height);
    }

    ctx.restore();
  }

  // Standalone Turntable Car Renderer for Garage & UI Preview
  public static renderCarPreview(
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    car: CarModel, 
    angleDeg: number = 0
  ) {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((angleDeg * Math.PI) / 180);

    const carW = 54;
    const carH = 100;
    const hw = carW / 2;
    const hh = carH / 2;

    // Platform ring shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, carW * 0.8, carH * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tires
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-hw - 4, -hh + 14, 6, 16);
    ctx.fillRect(hw - 2, -hh + 14, 6, 16);
    ctx.fillRect(-hw - 4, hh - 26, 6, 16);
    ctx.fillRect(hw - 2, hh - 26, 6, 16);

    // Car Body
    this.drawCarBody(ctx, hw, hh, car);

    // Taillights
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-hw + 4, hh - 4, 8, 4);
    ctx.fillRect(hw - 12, hh - 4, 8, 4);

    // Headlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-hw + 4, -hh, 8, 4);
    ctx.fillRect(hw - 12, -hh, 8, 4);

    ctx.restore();
  }

  // Rounded rectangle helper
  private static roundRect(
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    r: number
  ) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Color lighter utility
  private static lightenColor(col: string, amt: number): string {
    let usePound = false;
    if (col[0] === '#') {
      col = col.slice(1);
      usePound = true;
    }
    const num = parseInt(col, 16);
    if (isNaN(num)) return col;

    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;

    let b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;

    let g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
  }
}
