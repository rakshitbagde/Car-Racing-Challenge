import { CarModel } from '../types/game';

export const CARS: CarModel[] = [
  {
    id: 'starter_coupe',
    name: 'Apex Alpha',
    price: 0,
    topSpeedKmh: 200,
    handling: 6,
    shieldArmor: 5,
    tagline: 'Standard issue street racer. Nimble and balanced.',
    bodyStyle: 'sports',
    colors: {
      primary: '#ef4444', // Crimson red
      secondary: '#1e293b',
      accent: '#facc15', // Yellow stripe
      glow: '#ef444488',
      windshield: '#0284c7'
    }
  },
  {
    id: 'dune_phantom',
    name: 'Dune Phantom',
    price: 150,
    topSpeedKmh: 220,
    handling: 8,
    shieldArmor: 6,
    tagline: 'Rally-tuned chassis with fast lane transition and oil recovery.',
    bodyStyle: 'buggy',
    colors: {
      primary: '#f97316', // Orange
      secondary: '#292524',
      accent: '#fbbf24',
      glow: '#f9731688',
      windshield: '#38bdf8'
    }
  },
  {
    id: 'neon_striker',
    name: 'Neon Striker',
    price: 350,
    topSpeedKmh: 250,
    handling: 7.5,
    shieldArmor: 6,
    tagline: 'Sleek aerodynamic coupe built for high-speed highway sprints.',
    bodyStyle: 'supercar',
    colors: {
      primary: '#06b6d4', // Cyan
      secondary: '#0f172a',
      accent: '#a855f7', // Purple accent
      glow: '#06b6d499',
      windshield: '#22d3ee'
    }
  },
  {
    id: 'ironclad_fortress',
    name: 'Titan Enforcer',
    price: 650,
    topSpeedKmh: 235,
    handling: 6.5,
    shieldArmor: 9.5,
    tagline: 'Heavy armored interceptor. Prolonged invulnerability and reinforced frame.',
    bodyStyle: 'armored',
    colors: {
      primary: '#10b981', // Emerald green
      secondary: '#064e3b',
      accent: '#34d399',
      glow: '#10b98188',
      windshield: '#6ee7b7'
    }
  },
  {
    id: 'viper_gt',
    name: 'Viper GTS',
    price: 1100,
    topSpeedKmh: 285,
    handling: 8.5,
    shieldArmor: 7,
    tagline: 'Twin-turbo track weapon with explosive nitro acceleration.',
    bodyStyle: 'muscle',
    colors: {
      primary: '#e11d48', // Ruby rose
      secondary: '#18181b',
      accent: '#ffffff',
      glow: '#e11d4899',
      windshield: '#38bdf8'
    }
  },
  {
    id: 'spectre_hyperion',
    name: 'Spectre Hyperion',
    price: 1800,
    topSpeedKmh: 320,
    handling: 9.5,
    shieldArmor: 9,
    tagline: 'Prototype futuristic hypercar engineered for ultimate circuit dominance.',
    bodyStyle: 'hyper',
    colors: {
      primary: '#8b5cf6', // Violet
      secondary: '#0f172a',
      accent: '#ec4899', // Hot pink
      glow: '#8b5cf6cc',
      windshield: '#c084fc'
    }
  }
];

export const DEFAULT_CAR_ID = 'starter_coupe';
