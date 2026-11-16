import React from 'react';
import { ArrowLeft, ArrowRight, ChevronsUp, Flame, Disc } from 'lucide-react';
import { sound } from '../services/sound';

interface MobileControlsProps {
  steer: (dir: -1 | 1) => void;
  setBoost: (b: boolean) => void;
  setBrake: (b: boolean) => void;
  visible: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  steer,
  setBoost,
  setBrake,
  visible,
}) => {
  if (!visible) return null;

  return (
    <div className="absolute bottom-6 inset-x-0 px-5 flex items-center justify-between pointer-events-none z-30 select-none">
      {/* Steering Buttons (Left / Right) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            sound.playClick();
            steer(-1);
          }}
          onMouseDown={() => {
            sound.playClick();
            steer(-1);
          }}
          className="w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-cyan-600/60 backdrop-blur-md border border-slate-700 active:border-cyan-400 flex items-center justify-center text-white active:scale-95 shadow-xl transition-all touch-none"
          aria-label="Steer Left"
        >
          <ArrowLeft className="w-8 h-8 text-cyan-400" />
        </button>

        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            sound.playClick();
            steer(1);
          }}
          onMouseDown={() => {
            sound.playClick();
            steer(1);
          }}
          className="w-16 h-16 rounded-2xl bg-slate-900/80 active:bg-cyan-600/60 backdrop-blur-md border border-slate-700 active:border-cyan-400 flex items-center justify-center text-white active:scale-95 shadow-xl transition-all touch-none"
          aria-label="Steer Right"
        >
          <ArrowRight className="w-8 h-8 text-cyan-400" />
        </button>
      </div>

      {/* Speed Controls (Brake / Boost) */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Brake Button */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            sound.playClick();
            setBrake(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setBrake(false);
          }}
          onMouseDown={() => setBrake(true)}
          onMouseUp={() => setBrake(false)}
          onMouseLeave={() => setBrake(false)}
          className="w-15 h-15 rounded-2xl bg-slate-900/80 active:bg-rose-600/60 backdrop-blur-md border border-slate-700 active:border-rose-400 flex flex-col items-center justify-center text-white active:scale-95 shadow-xl transition-all touch-none"
          aria-label="Brake"
        >
          <Disc className="w-6 h-6 text-rose-400" />
          <span className="text-[10px] font-bold text-rose-400 tracking-wider uppercase mt-0.5">
            Brake
          </span>
        </button>

        {/* Boost / Gas Button */}
        <button
          type="button"
          onTouchStart={(e) => {
            e.preventDefault();
            sound.playClick();
            setBoost(true);
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setBoost(false);
          }}
          onMouseDown={() => setBoost(true)}
          onMouseUp={() => setBoost(false)}
          onMouseLeave={() => setBoost(false)}
          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 active:from-cyan-400 active:to-blue-400 backdrop-blur-md border border-cyan-400 flex flex-col items-center justify-center text-white active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all touch-none"
          aria-label="Boost"
        >
          <Flame className="w-7 h-7 text-white animate-pulse" />
          <span className="text-[10px] font-black text-white tracking-wider uppercase">
            Boost
          </span>
        </button>
      </div>
    </div>
  );
};
