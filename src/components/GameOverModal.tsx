import React, { useEffect, useRef } from 'react';
import { Play, Warehouse, Home, Trophy, Coins, RotateCcw, Award } from 'lucide-react';
import { sound } from '../services/sound';

interface GameOverModalProps {
  score: number;
  distance: number;
  coinsEarned: number;
  bestScore: number;
  isNewHighScore: boolean;
  onPlayAgain: () => void;
  onGarage: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  distance,
  coinsEarned,
  bestScore,
  isNewHighScore,
  onPlayAgain,
  onGarage,
  onHome,
}) => {
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Confetti effect if new high score
  useEffect(() => {
    if (!isNewHighScore) return;
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const count = 75;
    const confettiColors = ['#f59e0b', '#06b6d4', '#ec4899', '#10b981', '#ffffff', '#8b5cf6'];
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * -window.innerHeight,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      size: 6 + Math.random() * 6,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    }));

    const render = () => {
      animId = requestAnimationFrame(render);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
    };

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    render();

    return () => cancelAnimationFrame(animId);
  }, [isNewHighScore]);

  return (
    <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none overflow-hidden">
      {/* Confetti Canvas */}
      {isNewHighScore && (
        <canvas
          ref={confettiCanvasRef}
          className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />
      )}

      <div className="relative z-20 w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Banner */}
        {isNewHighScore ? (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-racing font-bold text-xs uppercase tracking-wider animate-bounce">
              <Trophy className="w-3.5 h-3.5" /> New High Score!
            </span>
            <h2 className="text-3xl font-racing font-black text-white uppercase tracking-wider mt-1 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              Glorious Run
            </h2>
          </div>
        ) : (
          <div className="mb-2">
            <span className="text-xs uppercase tracking-[0.25em] font-bold text-rose-500">
              Chassis Destroyed
            </span>
            <h2 className="text-3xl font-racing font-black text-white uppercase tracking-wider mt-0.5">
              Game Over
            </h2>
          </div>
        )}

        {/* Primary Score Counter */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl py-3 px-4 my-2 flex flex-col items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Points
          </span>
          <span className="font-racing font-black text-4xl text-white tabular-nums tracking-tight mt-0.5">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2 my-2 text-center">
          {/* Distance */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Distance
            </span>
            <span className="font-racing font-bold text-sm text-cyan-300 tabular-nums mt-0.5">
              {distance >= 1000 ? `${(distance / 1000).toFixed(2)} km` : `${distance} m`}
            </span>
          </div>

          {/* Coins Earned */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Coins
            </span>
            <span className="font-racing font-bold text-sm text-amber-400 tabular-nums mt-0.5 flex items-center gap-1">
              +{coinsEarned}
            </span>
          </div>

          {/* All-time Best */}
          <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Best
            </span>
            <span className="font-racing font-bold text-sm text-slate-200 tabular-nums mt-0.5">
              {bestScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Buttons Action Group */}
        <div className="flex flex-col gap-2.5 w-full mt-3">
          {/* Play Again */}
          <button
            onClick={() => {
              sound.playClick();
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-98 text-white font-racing font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400 cursor-pointer transition-all"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Play Again</span>
          </button>

          <div className="grid grid-cols-2 gap-2 w-full">
            {/* Garage */}
            <button
              onClick={() => {
                sound.playClick();
                onGarage();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-racing font-bold text-sm flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
            >
              <Warehouse className="w-4 h-4 text-cyan-400" />
              <span>Garage</span>
            </button>

            {/* Home */}
            <button
              onClick={() => {
                sound.playClick();
                onHome();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-racing font-bold text-sm flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer transition-all"
            >
              <Home className="w-4 h-4 text-slate-400" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
