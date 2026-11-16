import React, { useRef, useEffect } from 'react';
import { CarModel } from '../types/game';
import { CanvasRenderer } from '../game/canvasRenderer';
import { Play, Warehouse, Trophy, Settings, Coins, Award } from 'lucide-react';
import { sound } from '../services/sound';

interface HomeScreenProps {
  selectedCar: CarModel;
  coins: number;
  topScore: number;
  onPlay: () => void;
  onOpenGarage: () => void;
  onOpenLeaderboard: () => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedCar,
  coins,
  topScore,
  onPlay,
  onOpenGarage,
  onOpenLeaderboard,
  onOpenSettings,
}) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Turntable rotation animation
  useEffect(() => {
    let animId = 0;
    let angle = 0;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      angle = (angle + 0.8) % 360;
      CanvasRenderer.renderCarPreview(ctx, 220, 220, selectedCar, angle);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [selectedCar]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between items-center p-6 bg-slate-950 overflow-y-auto arcade-grid">
      {/* Top Status Bar */}
      <div className="w-full max-w-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-slate-900/80 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="font-racing font-bold text-sm text-white tabular-nums">
            {coins.toLocaleString()}
          </span>
        </div>

        {topScore > 0 && (
          <div className="flex items-center gap-2 bg-slate-900/80 border border-cyan-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
            <Award className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">BEST:</span>
            <span className="font-racing font-bold text-sm text-cyan-300 tabular-nums">
              {topScore.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Main Title & Hero Car Preview */}
      <div className="flex flex-col items-center my-auto z-10 text-center">
        {/* Brand Headline */}
        <div className="mb-2">
          <span className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
            Apex Velocity
          </span>
          <h1 className="text-4xl sm:text-5xl font-racing font-extrabold tracking-tight text-white uppercase mt-1 drop-shadow-[0_4px_24px_rgba(255,255,255,0.25)]">
            Car Racing
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Dodge traffic, grab power-ups & conquer the circuit
          </p>
        </div>

        {/* 360 Animated Car Showcase */}
        <div className="relative my-4 flex flex-col items-center">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Glowing Podium Rings */}
            <div className="absolute inset-4 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
            <div className="absolute inset-8 rounded-full bg-gradient-to-b from-cyan-500/10 to-transparent blur-md" />
            <canvas
              ref={previewCanvasRef}
              width={220}
              height={220}
              className="relative z-10 w-52 h-52 block"
            />
          </div>

          {/* Selected Car Tag */}
          <div className="flex flex-col items-center">
            <span className="font-racing font-bold text-lg text-white">
              {selectedCar.name}
            </span>
            <span className="text-xs text-slate-400 max-w-xs text-center">
              {selectedCar.tagline}
            </span>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={() => {
            sound.playClick();
            onPlay();
          }}
          className="group relative w-64 sm:w-72 py-4 px-8 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 active:scale-95 text-white font-racing font-black text-xl tracking-wider uppercase shadow-[0_0_30px_rgba(225,29,72,0.5)] border border-rose-400 flex items-center justify-center gap-3 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white text-white group-hover:scale-110 transition-transform" />
          <span>Race Now</span>
        </button>
      </div>

      {/* Bottom Navigation Grid */}
      <div className="w-full max-w-md grid grid-cols-3 gap-3 z-10 mt-4">
        {/* Garage */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenGarage();
          }}
          className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 border border-slate-700/60 hover:border-cyan-500/40 rounded-xl transition-all cursor-pointer"
        >
          <Warehouse className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Garage</span>
        </button>

        {/* Leaderboard */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenLeaderboard();
          }}
          className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 border border-slate-700/60 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer"
        >
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-semibold text-slate-200">Top Ranks</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            sound.playClick();
            onOpenSettings();
          }}
          className="flex flex-col items-center justify-center gap-1.5 py-3.5 px-2 bg-slate-900/80 hover:bg-slate-800/90 active:scale-95 border border-slate-700/60 hover:border-slate-500/40 rounded-xl transition-all cursor-pointer"
        >
          <Settings className="w-5 h-5 text-slate-300" />
          <span className="text-xs font-semibold text-slate-200">Settings</span>
        </button>
      </div>
    </div>
  );
};
