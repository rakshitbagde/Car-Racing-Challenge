import React, { useState, useRef, useEffect } from 'react';
import { CARS } from '../data/cars';
import { CarModel } from '../types/game';
import { CanvasRenderer } from '../game/canvasRenderer';
import { 
  ArrowLeft, 
  Coins, 
  Lock, 
  Check, 
  Gauge, 
  Sliders, 
  ShieldCheck, 
  Sparkles,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { sound } from '../services/sound';

interface GarageScreenProps {
  selectedCar: CarModel;
  coins: number;
  unlockedCarIds: string[];
  onSelectCar: (carId: string) => void;
  onUnlockCar: (carId: string, price: number) => boolean;
  onBack: () => void;
}

export const GarageScreen: React.FC<GarageScreenProps> = ({
  selectedCar,
  coins,
  unlockedCarIds,
  onSelectCar,
  onUnlockCar,
  onBack,
}) => {
  const [viewIndex, setViewIndex] = useState<number>(() => {
    const idx = CARS.findIndex((c) => c.id === selectedCar.id);
    return idx >= 0 ? idx : 0;
  });

  const [angle, setAngle] = useState<number>(0);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);

  const currentCar = CARS[viewIndex];
  const isUnlocked = unlockedCarIds.includes(currentCar.id);
  const isSelected = selectedCar.id === currentCar.id;
  const canAfford = coins >= currentCar.price;

  // Auto-rotate turntable unless dragged
  useEffect(() => {
    let animId = 0;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      animId = requestAnimationFrame(render);
      if (!isDraggingRef.current) {
        setAngle((prev) => (prev + 0.9) % 360);
      }
      CanvasRenderer.renderCarPreview(ctx, 240, 240, currentCar, angle);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [currentCar, angle]);

  const handlePrevCar = () => {
    sound.playClick();
    setViewIndex((prev) => (prev === 0 ? CARS.length - 1 : prev - 1));
  };

  const handleNextCar = () => {
    sound.playClick();
    setViewIndex((prev) => (prev === CARS.length - 1 ? 0 : prev + 1));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.clientX;
    setAngle((prev) => (prev + dx * 0.8) % 360);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || e.touches.length === 0) return;
    const dx = e.touches[0].clientX - lastMouseXRef.current;
    lastMouseXRef.current = e.touches[0].clientX;
    setAngle((prev) => (prev + dx * 0.8) % 360);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  const handleAction = () => {
    sound.playClick();
    if (isSelected) return;

    if (isUnlocked) {
      onSelectCar(currentCar.id);
    } else {
      if (canAfford) {
        const success = onUnlockCar(currentCar.id, currentCar.price);
        if (success) {
          sound.playPowerUp();
          onSelectCar(currentCar.id);
        }
      }
    }
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

        <h2 className="font-racing font-extrabold text-xl text-white tracking-wider uppercase">
          Garage & Tuning
        </h2>

        {/* Coins indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 border border-amber-500/40 px-3 py-1.5 rounded-xl text-amber-400 font-racing font-bold text-sm shadow-md">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="tabular-nums text-white">{coins.toLocaleString()}</span>
        </div>
      </div>

      {/* Main Showcase Turntable */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center my-auto z-10">
        {/* Carousel arrows + Turntable Canvas */}
        <div className="relative w-full flex items-center justify-center py-2">
          {/* Prev Button */}
          <button
            onClick={handlePrevCar}
            className="absolute left-2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white active:scale-90 transition-all cursor-pointer shadow-lg"
            aria-label="Previous Car"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Interactive Turntable */}
          <div
            className="relative w-64 h-64 flex items-center justify-center cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ambient turntable glow */}
            <div 
              className="absolute inset-4 rounded-full blur-xl opacity-30 transition-colors duration-300"
              style={{ backgroundColor: currentCar.colors.primary }}
            />
            <div className="absolute inset-8 rounded-full border border-slate-700/60" />

            <canvas
              ref={previewCanvasRef}
              width={240}
              height={240}
              className="relative z-10 w-60 h-60 block"
            />
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextCar}
            className="absolute right-2 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white active:scale-90 transition-all cursor-pointer shadow-lg"
            aria-label="Next Car"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Car Name & Tagline */}
        <div className="text-center mt-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="font-racing font-black text-2xl text-white tracking-wide">
              {currentCar.name}
            </h3>
            {isSelected && (
              <span className="text-[11px] font-bold uppercase bg-emerald-500/20 border border-emerald-500 text-emerald-300 px-2.5 py-0.5 rounded-full">
                Equipped
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {currentCar.tagline}
          </p>
        </div>

        {/* Specs & Stat Bars */}
        <div className="w-full bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mt-4 flex flex-col gap-3 shadow-xl">
          {/* Top Speed */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Top Speed
              </span>
              <span className="font-racing font-bold text-white tabular-nums">
                {currentCar.topSpeedKmh} km/h
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentCar.topSpeedKmh / 320) * 100}%` }}
              />
            </div>
          </div>

          {/* Handling */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Handling & Grip
              </span>
              <span className="font-racing font-bold text-white tabular-nums">
                {currentCar.handling} / 10
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${(currentCar.handling / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Shield Armor */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 font-medium text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Chassis Armor
              </span>
              <span className="font-racing font-bold text-white tabular-nums">
                {currentCar.shieldArmor} / 10
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                style={{ width: `${(currentCar.shieldArmor / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Thumbnail Selector Strip */}
        <div className="flex items-center justify-center gap-2 w-full mt-4">
          {CARS.map((car, idx) => {
            const isUnlockedThumb = unlockedCarIds.includes(car.id);
            const isSelectedThumb = idx === viewIndex;
            return (
              <button
                key={car.id}
                onClick={() => {
                  sound.playClick();
                  setViewIndex(idx);
                }}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                  isSelectedThumb
                    ? 'border-cyan-400 bg-cyan-950/60 scale-110 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'border-slate-800 bg-slate-900/70 hover:border-slate-600'
                }`}
              >
                {/* Dot in primary color */}
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: car.colors.primary }}
                />
                {!isUnlockedThumb && (
                  <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Button: Equip / Unlock */}
        <div className="w-full mt-4">
          {isSelected ? (
            <div className="w-full py-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 font-racing font-bold text-center flex items-center justify-center gap-2">
              <Check className="w-5 h-5 text-emerald-400" />
              <span>Currently Equipped</span>
            </div>
          ) : isUnlocked ? (
            <button
              onClick={handleAction}
              className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white font-racing font-black text-lg tracking-wider uppercase border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <span>Equip Vehicle</span>
            </button>
          ) : (
            <button
              onClick={handleAction}
              disabled={!canAfford}
              className={`w-full py-3.5 rounded-xl font-racing font-black text-lg tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${
                canAfford
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-yellow-300 cursor-pointer active:scale-98'
                  : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              <Coins className="w-5 h-5" />
              <span>Unlock for {currentCar.price.toLocaleString()} Coins</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
