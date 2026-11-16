import { GameSettings, HighScoreRecord } from '../types/game';
import { DEFAULT_CAR_ID } from '../data/cars';

const KEYS = {
  COINS: 'car_racing_coins_v1',
  UNLOCKED_CARS: 'car_racing_unlocked_cars_v1',
  SELECTED_CAR: 'car_racing_selected_car_v1',
  HIGH_SCORES: 'car_racing_high_scores_v1',
  SETTINGS: 'car_racing_settings_v1',
};

export const DEFAULT_SETTINGS: GameSettings = {
  controlType: 'buttons', // Default to responsive on-screen buttons & keys
  soundEnabled: true,
  soundVolume: 0.8,
  engineHumEnabled: true,
  vibrationEnabled: true,
  graphicsQuality: 'high',
};

class StorageService {
  public getCoins(): number {
    try {
      const val = localStorage.getItem(KEYS.COINS);
      return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
    } catch {
      return 0;
    }
  }

  public setCoins(amount: number): void {
    try {
      localStorage.setItem(KEYS.COINS, Math.max(0, Math.floor(amount)).toString());
    } catch {
      // safe fallback
    }
  }

  public addCoins(amount: number): number {
    const current = this.getCoins();
    const updated = current + Math.max(0, Math.floor(amount));
    this.setCoins(updated);
    return updated;
  }

  public spendCoins(amount: number): boolean {
    const current = this.getCoins();
    if (current >= amount) {
      this.setCoins(current - amount);
      return true;
    }
    return false;
  }

  public getUnlockedCars(): string[] {
    try {
      const val = localStorage.getItem(KEYS.UNLOCKED_CARS);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed) && parsed.includes(DEFAULT_CAR_ID)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return [DEFAULT_CAR_ID];
  }

  public unlockCar(carId: string): void {
    const cars = this.getUnlockedCars();
    if (!cars.includes(carId)) {
      cars.push(carId);
      try {
        localStorage.setItem(KEYS.UNLOCKED_CARS, JSON.stringify(cars));
      } catch {
        // safe fallback
      }
    }
  }

  public getSelectedCarId(): string {
    try {
      const val = localStorage.getItem(KEYS.SELECTED_CAR);
      if (val && this.getUnlockedCars().includes(val)) {
        return val;
      }
    } catch {
      // fallback
    }
    return DEFAULT_CAR_ID;
  }

  public setSelectedCarId(carId: string): void {
    try {
      localStorage.setItem(KEYS.SELECTED_CAR, carId);
    } catch {
      // fallback
    }
  }

  public getHighScores(): HighScoreRecord[] {
    try {
      const val = localStorage.getItem(KEYS.HIGH_SCORES);
      if (val) {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5);
        }
      }
    } catch {
      // fallback
    }
    return [];
  }

  public saveScore(record: Omit<HighScoreRecord, 'id'>): { isNewHighScore: boolean; rank: number } {
    const list = this.getHighScores();
    const newRecord: HighScoreRecord = {
      ...record,
      id: Math.random().toString(36).substring(2, 9),
    };

    const isTopScore = list.length === 0 || record.score > list[0].score;
    const combined = [...list, newRecord].sort((a, b) => b.score - a.score).slice(0, 5);
    const rank = combined.findIndex((r) => r.id === newRecord.id) + 1;

    try {
      localStorage.setItem(KEYS.HIGH_SCORES, JSON.stringify(combined));
    } catch {
      // fallback
    }

    return {
      isNewHighScore: isTopScore && rank === 1,
      rank: rank > 0 ? rank : -1,
    };
  }

  public clearHighScores(): void {
    try {
      localStorage.removeItem(KEYS.HIGH_SCORES);
    } catch {
      // fallback
    }
  }

  public getSettings(): GameSettings {
    try {
      const val = localStorage.getItem(KEYS.SETTINGS);
      if (val) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
      }
    } catch {
      // fallback
    }
    return { ...DEFAULT_SETTINGS };
  }

  public saveSettings(settings: GameSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {
      // fallback
    }
  }
}

export const storage = new StorageService();
