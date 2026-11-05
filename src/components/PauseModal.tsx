import React, { useEffect } from 'react';
import { Play, RotateCcw, Home, ShoppingBag, Volume2, Music, Save, Settings } from 'lucide-react';
import { soundEngine } from '../audio/soundEngine';

interface PauseModalProps {
  onResume: () => void;
  onOpenStore: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  sfxVolume: number;
  musicVolume: number;
  onSfxVolumeChange: (vol: number) => void;
  onMusicVolumeChange: (vol: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onOpenStore,
  onRestart,
  onMainMenu,
  sfxVolume,
  musicVolume,
  onSfxVolumeChange,
  onMusicVolumeChange,
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'escape' || k === 'p' || k === ' ') {
        e.preventDefault();
        soundEngine.playSound('click');
        onResume();
      } else if (k === 's') {
        e.preventDefault();
        soundEngine.playSound('click');
        onOpenStore();
      } else if (k === 'r') {
        e.preventDefault();
        soundEngine.playSound('click');
        onRestart();
      } else if (k === 'm') {
        e.preventDefault();
        soundEngine.playSound('click');
        onMainMenu();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onResume, onOpenStore, onRestart, onMainMenu]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="text-xl sm:text-2xl font-black font-['Press_Start_2P'] tracking-wider mb-1 text-amber-400 drop-shadow-md">
          PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Game suspended · Progress is safe
        </p>

        {/* Menu Actions */}
        <div className="w-full space-y-2.5 mb-6">
          <button
            onClick={() => {
              soundEngine.playSound('click');
              onResume();
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 hover:from-emerald-500 hover:to-green-400 text-white font-bold font-mono text-sm tracking-wide transition-all shadow-xl shadow-emerald-950/40 active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
          >
            <Play className="w-4 h-4" />
            <span>RESUME [ESC]</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              onOpenStore();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs tracking-wide transition-all shadow-md shadow-indigo-950/40 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-cyan-300" />
            <span>ARMORY & UPGRADES [S]</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              onRestart();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-slate-700/80"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART CURRENT WAVE [R]</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playSound('click');
              onMainMenu();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold font-mono text-xs tracking-wide transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer border border-slate-700/80"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU [M]</span>
          </button>
        </div>

        {/* Audio Tuning Sliders with percentage indicators */}
        <div className="w-full pt-4 border-t border-slate-800 space-y-3 text-left font-mono">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
              <span>SFX Volume</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={sfxVolume}
                onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-purple-400" />
              <span>Music Volume</span>
            </span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => onMusicVolumeChange(parseFloat(e.target.value))}
                className="w-24 accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 w-8 text-right tabular-nums">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
