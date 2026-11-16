import React, { useState, useEffect, useCallback } from 'react';
import { GameState, CarModel, GameSettings, HighScoreRecord } from './types/game';
import { CARS, DEFAULT_CAR_ID } from './data/cars';
import { storage } from './services/storage';
import { sound } from './services/sound';
import { useGameEngine } from './game/useGameEngine';
import { GameCanvas } from './components/GameCanvas';
import { GameHUD } from './components/GameHUD';
import { MobileControls } from './components/MobileControls';
import { HomeScreen } from './components/HomeScreen';
import { GarageScreen } from './components/GarageScreen';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('HOME');
  const [unlockedCarIds, setUnlockedCarIds] = useState<string[]>(() => storage.getUnlockedCars());
  const [selectedCarId, setSelectedCarId] = useState<string>(() => storage.getSelectedCarId());
  const [coins, setCoins] = useState<number>(() => storage.getCoins());
  const [settings, setSettings] = useState<GameSettings>(() => storage.getSettings());
  const [highScores, setHighScores] = useState<HighScoreRecord[]>(() => storage.getHighScores());

  // Game Over summary state
  const [lastRunResult, setLastRunResult] = useState<{
    score: number;
    distance: number;
    coinsEarned: number;
    isNewHighScore: boolean;
  } | null>(null);

  const selectedCar: CarModel = 
    CARS.find((c) => c.id === selectedCarId) || 
    CARS.find((c) => c.id === DEFAULT_CAR_ID)!;

  // Handle Game Over event
  const handleGameOver = useCallback((finalScore: number, distance: number, coinsEarned: number) => {
    // Record score
    const today = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

    const { isNewHighScore } = storage.saveScore({
      score: finalScore,
      distance,
      coins: coinsEarned,
      date: today,
      carId: selectedCar.id,
      carName: selectedCar.name,
    });

    // Update React state
    setHighScores(storage.getHighScores());
    setCoins(storage.getCoins());
    setLastRunResult({
      score: finalScore,
      distance,
      coinsEarned,
      isNewHighScore,
    });
    setGameState('GAMEOVER');
  }, [selectedCar]);

  // Initialize Game Engine Hook
  const {
    stateRef,
    stats,
    isPaused,
    startGame,
    togglePause,
    steer,
    setBoost,
    setBrake,
  } = useGameEngine(selectedCar, settings, handleGameOver);

  // Sync settings with Sound Engine
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
    sound.setVolume(settings.soundVolume);
    sound.engineHumEnabled = settings.engineHumEnabled;
    sound.vibrationEnabled = settings.vibrationEnabled;
  }, [settings]);

  // Start Playing
  const handleStartPlay = () => {
    setLastRunResult(null);
    setGameState('PLAYING');
    startGame();
  };

  // Car Selection in Garage
  const handleSelectCar = (carId: string) => {
    storage.setSelectedCarId(carId);
    setSelectedCarId(carId);
  };

  // Car Purchase in Garage
  const handleUnlockCar = (carId: string, price: number): boolean => {
    const success = storage.spendCoins(price);
    if (success) {
      storage.unlockCar(carId);
      setUnlockedCarIds(storage.getUnlockedCars());
      setCoins(storage.getCoins());
      return true;
    }
    return false;
  };

  // Settings Update
  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Clear High Scores
  const handleClearScores = () => {
    storage.clearHighScores();
    setHighScores([]);
  };

  const topScore = highScores.length > 0 ? highScores[0].score : 0;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center font-sans select-none touch-none">
      {/* Active Screen Rendering */}
      {gameState === 'HOME' && (
        <HomeScreen
          selectedCar={selectedCar}
          coins={coins}
          topScore={topScore}
          onPlay={handleStartPlay}
          onOpenGarage={() => setGameState('GARAGE')}
          onOpenLeaderboard={() => setGameState('LEADERBOARD')}
          onOpenSettings={() => setGameState('SETTINGS')}
        />
      )}

      {gameState === 'GARAGE' && (
        <GarageScreen
          selectedCar={selectedCar}
          coins={coins}
          unlockedCarIds={unlockedCarIds}
          onSelectCar={handleSelectCar}
          onUnlockCar={handleUnlockCar}
          onBack={() => setGameState('HOME')}
        />
      )}

      {gameState === 'LEADERBOARD' && (
        <LeaderboardScreen
          scores={highScores}
          onClearScores={handleClearScores}
          onBack={() => setGameState('HOME')}
        />
      )}

      {gameState === 'SETTINGS' && (
        <SettingsScreen
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onBack={() => setGameState('HOME')}
        />
      )}

      {/* Active Game View (also kept rendered during Pause and Game Over modal) */}
      {(gameState === 'PLAYING' || gameState === 'GAMEOVER') && (
        <div className="relative w-full h-full flex items-center justify-center bg-slate-950 overflow-hidden">
          {/* Main 2D Canvas */}
          <GameCanvas
            stateRef={stateRef}
            selectedCar={selectedCar}
            settings={settings}
            steer={steer}
            setBoost={setBoost}
            setBrake={setBrake}
          />

          {/* Heads Up Display (HUD) */}
          <GameHUD
            stats={stats}
            isPaused={isPaused}
            onPauseToggle={togglePause}
            soundEnabled={settings.soundEnabled}
            onSoundToggle={() => {
              const updated = !settings.soundEnabled;
              handleUpdateSettings({ ...settings, soundEnabled: updated });
            }}
          />

          {/* Mobile On-Screen Buttons (If Enabled) */}
          <MobileControls
            steer={steer}
            setBoost={setBoost}
            setBrake={setBrake}
            visible={settings.controlType === 'buttons'}
          />

          {/* Pause Modal */}
          {isPaused && gameState === 'PLAYING' && (
            <PauseModal
              onResume={togglePause}
              onRestart={() => {
                togglePause();
                startGame();
              }}
              onGarage={() => {
                togglePause();
                sound.stopEngine();
                setGameState('GARAGE');
              }}
              onHome={() => {
                togglePause();
                sound.stopEngine();
                setGameState('HOME');
              }}
              onSettings={() => {
                togglePause();
                sound.stopEngine();
                setGameState('SETTINGS');
              }}
            />
          )}

          {/* Game Over Modal */}
          {gameState === 'GAMEOVER' && lastRunResult && (
            <GameOverModal
              score={lastRunResult.score}
              distance={lastRunResult.distance}
              coinsEarned={lastRunResult.coinsEarned}
              bestScore={topScore}
              isNewHighScore={lastRunResult.isNewHighScore}
              onPlayAgain={() => {
                setGameState('PLAYING');
                startGame();
              }}
              onGarage={() => {
                sound.stopEngine();
                setGameState('GARAGE');
              }}
              onHome={() => {
                sound.stopEngine();
                setGameState('HOME');
              }}
            />
          )}
        </div>
      )}
    </main>
  );
}
