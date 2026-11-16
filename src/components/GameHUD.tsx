import React from 'react';
import { GameLoopStats } from '../game/useGameEngine';
import { 
  Heart, 
  Coins, 
  Gauge, 
  Pause, 
  Volume2, 
  VolumeX, 
  Shield, 
  Magnet, 
  Zap, 
  Sparkles 
} from 'lucide-react';
import { sound } from '../services/sound';

interface GameHUDProps {
  stats: GameLoopStats;
  isPaused: boolean;
  onPauseToggle: () => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  isPaused,
  onPauseToggle,
  soundEnabled,
  onSoundToggle,
}) => {
  const {
    speedKmh,
    distanceMeters,
    score,
    coinsRun,
    lives,
    maxLives,
    level,
    levelName,
    activePowerUps,
    levelUpAnnouncement,
  } = stats;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 z-20">
      {/* Top Bar HUD */}
      <div className="flex items-start justify-between gap-3 w-full max-w-4xl mx-auto">
        {/* Left: Lives & Level */}
        <div className="flex flex-col gap-1.5">
          {/* Hearts */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg">
            {Array.from({ length: maxLives }).map((_, i) => {
              const isFilled = i < lives;
              return (
                <Heart
                  key={i}
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isFilled
                      ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                      : 'text-slate-600 fill-transparent opacity-40'
                  }`}
                />
              );
            })}
          </div>

          {/* Level Info */}
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-900/70 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-800">
            Stage {level} <span className="text-slate-500">·</span> {levelName}
          </div>
        </div>

        {/* Center: Score & Distance */}
        <div className="flex flex-col items-center">
          <div className="bg-slate-950/85 backdrop-blur-md px-5 py-1.5 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] flex flex-col items-center">
            <span className="text-2xl font-bold font-racing tracking-tight text-white tabular-nums drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]">
              {score.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-cyan-400 tabular-nums">
              {distanceMeters >= 1000
                ? `${(distanceMeters / 1000).toFixed(2)} km`
                : `${distanceMeters} m`}
            </span>
          </div>
        </div>

        {/* Right: Coins & Controls */}
        <div className="flex items-center gap-2">
          {/* Coins Run */}
          <div className="flex items-center gap-1.5 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-amber-500/30 text-amber-400 font-racing font-bold text-sm shadow-md">
            <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="tabular-nums text-white">{coinsRun}</span>
          </div>

          {/* Mute Audio Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onSoundToggle();
            }}
            className="pointer-events-auto p-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-slate-700/60 text-slate-300 hover:text-white transition-colors active:scale-95"
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              sound.playClick();
              onPauseToggle();
            }}
            className="pointer-events-auto p-2 bg-slate-900/80 hover:bg-slate-800 backdrop-blur-md rounded-xl border border-slate-700/60 text-slate-300 hover:text-white transition-colors active:scale-95"
            title="Pause Game (Space / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Center Animated Announcement (Level Up!) */}
      {levelUpAnnouncement && (
        <div className="self-center my-auto">
          <div className="bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-racing font-black text-xl sm:text-2xl tracking-widest px-8 py-3 rounded-2xl shadow-[0_0_35px_rgba(99,102,241,0.8)] border border-cyan-300 animate-bounce text-center">
            ⚡ {levelUpAnnouncement} ⚡
          </div>
        </div>
      )}

      {/* Bottom Area: Speedometer & Active Power-Ups */}
      <div className="flex items-end justify-between w-full max-w-4xl mx-auto mb-1">
        {/* Speedometer Gauge Box */}
        <div className="bg-slate-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 flex items-center gap-3 shadow-xl">
          <Gauge className="w-6 h-6 text-cyan-400" />
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="font-racing font-black text-2xl text-white tabular-nums tracking-tight">
                {speedKmh}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400">
                km/h
              </span>
            </div>
            {/* Speed Bar */}
            <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full transition-all duration-100"
                style={{ width: `${Math.min(100, (speedKmh / 320) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Power-Ups Badges */}
        <div className="flex items-center gap-2">
          {activePowerUps.map((pu) => {
            const pct = Math.max(0, Math.min(100, (pu.durationMs / pu.maxDurationMs) * 100));
            return (
              <div
                key={pu.type}
                className="bg-slate-900/90 backdrop-blur-md border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 animate-pulse"
              >
                {pu.type === 'shield' && <Shield className="w-4 h-4 text-cyan-400" />}
                {pu.type === 'magnet' && <Magnet className="w-4 h-4 text-red-400" />}
                {pu.type === 'nitro' && <Zap className="w-4 h-4 text-emerald-400" />}
                {pu.type === 'double_coins' && <Sparkles className="w-4 h-4 text-amber-400" />}

                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                    {pu.type === 'double_coins' ? '2X' : pu.type}
                  </span>
                  <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full transition-all duration-100"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
