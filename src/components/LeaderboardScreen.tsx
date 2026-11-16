import React from 'react';
import { HighScoreRecord } from '../types/game';
import { ArrowLeft, Trophy, Medal, Trash2, Calendar, Gauge } from 'lucide-react';
import { sound } from '../services/sound';

interface LeaderboardScreenProps {
  scores: HighScoreRecord[];
  onClearScores: () => void;
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  scores,
  onClearScores,
  onBack,
}) => {
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
          <Trophy className="w-5 h-5 text-amber-400" />
          Leaderboard
        </h2>

        {scores.length > 0 ? (
          <button
            onClick={() => {
              if (window.confirm('Reset all high scores?')) {
                sound.playClick();
                onClearScores();
              }
            }}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-red-950/80 border border-slate-800 hover:border-red-700 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Clear High Scores"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Scores List */}
      <div className="w-full max-w-xl mx-auto flex flex-col gap-3 my-auto py-4 z-10">
        {scores.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-2xl border border-slate-800">
            <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-racing font-bold text-lg text-slate-300">
              No Records Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Complete your first race to establish high scores!
            </p>
          </div>
        ) : (
          scores.map((rec, index) => {
            let rankColor = 'text-slate-400 bg-slate-800 border-slate-700';
            let medalIcon = null;

            if (index === 0) {
              rankColor = 'text-amber-300 bg-amber-950/80 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
              medalIcon = <Medal className="w-5 h-5 text-amber-400" />;
            } else if (index === 1) {
              rankColor = 'text-slate-200 bg-slate-800/90 border-slate-400/60';
              medalIcon = <Medal className="w-5 h-5 text-slate-300" />;
            } else if (index === 2) {
              rankColor = 'text-amber-600 bg-amber-950/40 border-amber-700/60';
              medalIcon = <Medal className="w-5 h-5 text-amber-600" />;
            }

            return (
              <div
                key={rec.id}
                className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border backdrop-blur-md transition-all ${rankColor}`}
              >
                {/* Rank & Car Name */}
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-950/70 border border-slate-700 flex items-center justify-center font-racing font-black text-sm">
                    {medalIcon || `#${index + 1}`}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-racing font-bold text-base text-white tracking-wide">
                      {rec.carName}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {rec.date}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">
                        {rec.distance >= 1000
                          ? `${(rec.distance / 1000).toFixed(2)} km`
                          : `${rec.distance} m`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-end">
                  <span className="font-racing font-black text-xl sm:text-2xl text-white tabular-nums tracking-tight">
                    {rec.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
                    Points
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Info Banner */}
      <div className="w-full max-w-xl mx-auto text-center z-10">
        <p className="text-xs text-slate-500">
          Rankings are saved locally on this browser. Push your limits and set new circuit records!
        </p>
      </div>
    </div>
  );
};
