import React, { useEffect, useRef } from 'react';
import { CanvasRenderer, RenderState } from '../game/canvasRenderer';
import { CarModel, GameSettings } from '../types/game';

interface GameCanvasProps {
  stateRef: React.MutableRefObject<any>;
  selectedCar: CarModel;
  settings: GameSettings;
  steer: (dir: -1 | 1) => void;
  setBoost: (b: boolean) => void;
  setBrake: (b: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  stateRef,
  selectedCar,
  settings,
  steer,
  setBoost,
  setBrake,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Resize canvas according to container dimensions and DPR
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const w = Math.floor(rect.width);
      const h = Math.floor(rect.height);

      canvasRef.current.width = w * dpr;
      canvasRef.current.height = h * dpr;

      // Update state dimensions
      const s = stateRef.current;
      s.width = w;
      s.height = h;

      // On mobile portrait, make road fill ~88% of screen; on desktop, max width ~480px
      const maxRoadW = Math.min(w * 0.90, 480);
      s.roadWidth = maxRoadW;
      s.roadLeft = Math.floor((w - maxRoadW) / 2);
      s.laneWidth = Math.floor(maxRoadW / s.lanesCount);
      s.playerY = h - 110;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [stateRef]);

  // Render loop directly connected to RAF
  useEffect(() => {
    let animId = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      const s = stateRef.current;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      ctx.save();
      ctx.scale(dpr, dpr);

      const renderState: RenderState = {
        playerX: s.playerX,
        playerY: s.playerY,
        playerWidth: s.playerWidth,
        playerHeight: s.playerHeight,
        playerTilt: s.playerTilt,
        selectedCar,
        speedKmh: s.speedKmh,
        distanceMeters: s.distanceMeters,
        roadScrollY: s.roadScrollY,
        lanesCount: s.lanesCount,
        roadWidth: s.roadWidth,
        roadLeft: s.roadLeft,
        laneWidth: s.laneWidth,
        theme: s.theme,
        obstacles: s.obstacles,
        coins: s.coins,
        powerUps: s.powerUps,
        particles: s.particles,
        skidMarks: s.skidMarks,
        activePowerUps: s.activePowerUps,
        isInvincible: s.isInvincible,
        invincibleBlink: performance.now() * 0.001,
        isOilSliding: s.isOilSliding,
        isBraking: s.isBraking,
        isBoosting: s.isBoosting,
        screenShake: s.screenShake,
        graphicsQuality: settings.graphicsQuality,
      };

      CanvasRenderer.renderGame(ctx, s.width, s.height, renderState);
      ctx.restore();
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [selectedCar, settings.graphicsQuality, stateRef]);

  // Touch and Swipe controls
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: performance.now(),
    };

    // If 'touch_half' mode is active, immediate tap to steer
    if (settings.controlType === 'touch_half') {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = touch.clientX - rect.left;
      if (clickX < rect.width * 0.5) {
        steer(-1);
      } else {
        steer(1);
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Prevent screen scroll and bounce
    e.preventDefault();
    if (!touchStartRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;

    // Swipe vertical for boost / brake
    if (dy < -40) {
      setBoost(true);
      setBrake(false);
    } else if (dy > 40) {
      setBrake(true);
      setBoost(false);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = performance.now() - touchStartRef.current.time;

    // In swipe mode, detect fast horizontal swipes
    if (settings.controlType === 'swipe' && dt < 450) {
      if (dx < -30) {
        steer(-1);
      } else if (dx > 30) {
        steer(1);
      }
    }

    setBoost(false);
    setBrake(false);
    touchStartRef.current = null;
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-full h-full block cursor-pointer touch-none"
      />
    </div>
  );
};
