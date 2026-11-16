import React from 'react';
import { GameSettings, ControlType } from '../types/game';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Gamepad2, 
  Smartphone, 
  Vibrate, 
  Sparkles,
  Keyboard,
  HelpCircle
} from 'lucide-react';
import { sound } from '../services/sound';

interface SettingsScreenProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  settings,
  onUpdateSettings,
  onBack,
}) => {
  const handleControlChange = (type: ControlType) => {
    sound.playClick();
    onUpdateSettings({ ...settings, controlType: type });
  };

  const handleToggleSound = () => {
    sound.playClick();
    const updated = !settings.soundEnabled;
    onUpdateSettings({ ...settings, soundEnabled: updated });
    sound.setEnabled(updated);
  };

  const handleToggleEngine = () => {
    sound.playClick();
    const updated = !settings.engineHumEnabled;
    onUpdateSettings({ ...settings, engineHumEnabled: updated });
    sound.engineHumEnabled = updated;
  };

  const handleToggleVibration = () => {
    sound.playClick();
    const updated = !settings.vibrationEnabled;
    onUpdateSettings({ ...settings, vibrationEnabled: updated });
    sound.vibrationEnabled = updated;
  };

  const handleToggleGraphics = () => {
    sound.playClick();
    const updated = settings.graphicsQuality === 'high' ? 'low' : 'high';
    onUpdateSettings({ ...settings, graphicsQuality: updated });
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-slate-950 overflow-y-auto arcade-grid select-none">
      {/* Header */}
      <div className="flex items-center justify-between w-full max-w-xl mx-auto z-10">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-xs font-semibold">Back</span>
        </button>

        <h2 className="font-racing font-extrabold text-xl text-white tracking-wider uppercase flex items-center gap-2">
          <SettingsIcon className="w-5 h-5 text-cyan-400" />
          Game Settings
        </h2>

        <div className="w-8" />
      </div>

      {/* Settings Options Container */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-4 my-auto py-3 z-10">
        {/* Control Scheme Selector */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-white font-racing font-bold text-sm">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Mobile Input Mode</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'buttons', label: 'On-Screen Keys', desc: 'Tactile buttons' },
              { id: 'touch_half', label: 'Tap Screen', desc: 'Left/Right half' },
              { id: 'swipe', label: 'Swipe Gesture', desc: 'Flick to switch' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleControlChange(mode.id as ControlType)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  settings.controlType === mode.id
                    ? 'border-cyan-400 bg-cyan-950/50 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold font-racing">{mode.label}</span>
                <span className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Audio Toggles */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-400" />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Audio Effects</span>
                <span className="text-xs text-slate-400">Crash, coin chime & fanfares</span>
              </div>
            </div>
            <button
              onClick={handleToggleSound}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.soundEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-800/80" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Dynamic Engine Hum</span>
                <span className="text-xs text-slate-400">Synthesized RPM audio modulation</span>
              </div>
            </div>
            <button
              onClick={handleToggleEngine}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.engineHumEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.engineHumEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Haptics & Graphics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Vibrate className="w-4 h-4 text-rose-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Device Vibration</span>
                <span className="text-xs text-slate-400">Haptic feedback on impact & crashes</span>
              </div>
            </div>
            <button
              onClick={handleToggleVibration}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.vibrationEnabled ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                  settings.vibrationEnabled ? 'translate-x-6.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          <div className="h-px bg-slate-800/80" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">Graphics Fidelity</span>
                <span className="text-xs text-slate-400">
                  {settings.graphicsQuality === 'high' ? 'High (Particle & rain effects)' : 'Low (Battery saver)'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleGraphics}
              className={`px-3 py-1 rounded-lg font-racing font-bold text-xs uppercase border cursor-pointer transition-all ${
                settings.graphicsQuality === 'high'
                  ? 'border-indigo-500/80 bg-indigo-950/60 text-indigo-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {settings.graphicsQuality}
            </button>
          </div>
        </div>

        {/* Desktop Controls Reference Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-slate-300 font-racing font-bold text-xs uppercase tracking-wider mb-2.5">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>Desktop Keyboard Controls</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
            <div><span className="text-slate-200 font-mono">← / A</span> : Steer Left</div>
            <div><span className="text-slate-200 font-mono">→ / D</span> : Steer Right</div>
            <div><span className="text-slate-200 font-mono">↑ / W</span> : Boost Throttle</div>
            <div><span className="text-slate-200 font-mono">↓ / S</span> : Brake</div>
            <div><span className="text-slate-200 font-mono">Space / P</span> : Pause / Resume</div>
            <div><span className="text-slate-200 font-mono">Esc</span> : Exit / Menu</div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl mx-auto text-center z-10">
        <p className="text-xs text-slate-500">
          Apex Velocity v1.0 · Zero external assets · Pure Web Audio & Canvas 2D
        </p>
      </div>
    </div>
  );
};
