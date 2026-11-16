import React from 'react';
import { Play, RotateCcw, Warehouse, Home, Settings } from 'lucide-react';
import { sound } from '../services/sound';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onGarage: () => void;
  onHome: () => void;
  onSettings: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onGarage,
  onHome,
  onSettings,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 select-none">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        <div>
          <span className="text-xs uppercase tracking-[0.25em] font-bold text-cyan-400">
            Game Suspended
          </span>
          <h2 className="text-2xl font-racing font-black text-white uppercase tracking-wider mt-0.5">
            Paused
          </h2>
        </div>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          {/* Resume */}
          <button
            onClick={() => {
              sound.playClick();
              onResume();
            }}
            className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white font-racing font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 cursor-pointer transition-all"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume Race</span>
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              sound.playClick();
              onRestart();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-racing font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Restart Run</span>
          </button>

          {/* Garage */}
          <button
            onClick={() => {
              sound.playClick();
              onGarage();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-racing font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
          >
            <Warehouse className="w-4 h-4 text-indigo-400" />
            <span>Garage</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              sound.playClick();
              onSettings();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-racing font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </button>

          {/* Home */}
          <button
            onClick={() => {
              sound.playClick();
              onHome();
            }}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-slate-200 font-racing font-semibold text-sm flex items-center justify-center gap-2 border border-slate-700 cursor-pointer transition-all"
          >
            <Home className="w-4 h-4 text-rose-400" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
