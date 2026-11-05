import React, { useEffect } from 'react';
import { RotateCcw, ShoppingBag, Home, Skull, Trophy, Star } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface GameOverModalProps {
  level: number;
  deaths: number;
  coins: number;
  highLevel: number;
  onRespawn: () => void;
  onOpenStore: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  deaths,
  coins,
  highLevel,
  onRespawn,
  onOpenStore,
  onMainMenu,
}) => {
  const isNewRecord = level >= highLevel && level > 1;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === ' ' || k === 'enter') {
        e.preventDefault();
        soundEngine.playSound('jump');
        onRespawn();
      } else if (k === 's') {
        e.preventDefault();
        soundEngine.playSound('click');
        onOpenStore();
      } else if (k === 'm' || k === 'escape') {
        e.preventDefault();
        soundEngine.playSound('click');
        onMainMenu();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onRespawn, onOpenStore, onMainMenu]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-rose-500/50 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center">
        {/* Skull Icon */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/60 flex items-center justify-center text-rose-400 mb-3 animate-pulse shadow-lg shadow-rose-950/50">
          <Skull className="w-7 h-7" />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-rose-500 font-['Press_Start_2P'] tracking-wider mb-1.5 drop-shadow-md">
          GAME OVER
        </h2>
        <p className="text-xs text-slate-400 mb-5">
          GP fell in combat. Re-arm and conquer the waves!
        </p>

        {/* Record Badge */}
        {isNewRecord && (
          <div className="w-full flex items-center justify-center gap-1.5 text-xs text-amber-300 font-mono mb-4 bg-amber-500/15 border border-amber-500/40 rounded-xl px-3 py-1.5 animate-bounce shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="font-bold">NEW BEST RECORD: LV {level}!</span>
          </div>
        )}

        {/* Stats Summary Table */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-3 mb-6 grid grid-cols-3 gap-2 text-center font-mono shadow-inner">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Wave</div>
            <div className="text-base font-bold text-sky-400 tabular-nums">LV {level}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Deaths</div>
            <div className="text-base font-bold text-rose-400 tabular-nums">☠️ {deaths}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-semibold">Gold Vault</div>
            <div className="text-base font-bold text-amber-400 tabular-nums">{coins} G</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-2.5">
          <button
            onClick={() => {
              soundEngine.playSound('jump');
              onRespawn();
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 via-red-500 to-rose-600 hover:from-rose-500 hover:to-red-400 text-white font-black font-mono text-sm tracking-wide transition-all shadow-xl shadow-rose-950/60 active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESPAWN & RETRY [SPACE]</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              onOpenStore();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs tracking-wide transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-300" />
            <span>UPGRADE IN ARMORY [S]</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              onMainMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold font-mono text-xs tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-slate-700/80"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO MENU [M]</span>
          </button>
        </div>
      </div>
    </div>
  );
};
