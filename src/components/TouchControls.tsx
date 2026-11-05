import React from 'react';
import { Zap, RotateCw, ArrowLeft, ArrowRight, ArrowUp, Crosshair, Shield } from 'lucide-react';

interface TouchControlsProps {
  onInputStart: (action: 'left' | 'right' | 'jump' | 'shoot' | 'shield') => void;
  onInputEnd: (action: 'left' | 'right' | 'jump' | 'shoot' | 'shield') => void;
  onTriggerUltimate: () => void;
  onCycleWeapon: () => void;
  isUltReady: boolean;
  activeKeys: {
    left: boolean;
    right: boolean;
    jump: boolean;
    shoot: boolean;
    shield: boolean;
  };
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputStart,
  onInputEnd,
  onTriggerUltimate,
  onCycleWeapon,
  isUltReady,
  activeKeys,
}) => {
  const handleTouch = (action: 'left' | 'right' | 'jump' | 'shoot' | 'shield') => {
    return {
      onTouchStart: (e: React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        onInputStart(action);
      },
      onTouchEnd: (e: React.TouchEvent) => {
        if (e.cancelable) e.preventDefault();
        onInputEnd(action);
      },
      onMouseDown: (e: React.MouseEvent) => {
        if (e.cancelable) e.preventDefault();
        onInputStart(action);
      },
      onMouseUp: (e: React.MouseEvent) => {
        if (e.cancelable) e.preventDefault();
        onInputEnd(action);
      },
      onMouseLeave: () => {
        if (activeKeys[action]) onInputEnd(action);
      },
    };
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between items-end p-3 sm:p-6 pb-4 sm:pb-6">
      {/* Left: Directional D-pad + Swap Gun */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <button
          onClick={onCycleWeapon}
          className="self-start px-3 py-1.5 rounded-xl bg-slate-900/85 border border-slate-700/80 text-sky-300 font-mono text-[10px] flex items-center gap-1.5 shadow-lg active:scale-95 cursor-pointer backdrop-blur-md"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>SWAP GUN</span>
        </button>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            {...handleTouch('left')}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-md transition-all active:scale-95 touch-none cursor-pointer border ${
              activeKeys.left
                ? 'bg-sky-500/90 border-sky-300 scale-95 shadow-[0_0_18px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-800/80'
            }`}
            aria-label="Move Left"
          >
            <ArrowLeft className="w-7 h-7" />
          </button>

          <button
            {...handleTouch('right')}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-md transition-all active:scale-95 touch-none cursor-pointer border ${
              activeKeys.right
                ? 'bg-sky-500/90 border-sky-300 scale-95 shadow-[0_0_18px_rgba(56,189,248,0.8)]'
                : 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-800/80'
            }`}
            aria-label="Move Right"
          >
            <ArrowRight className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Right: Ultimate, Shield, Fire, Jump */}
      <div className="flex items-end gap-2 sm:gap-3 pointer-events-auto">
        {/* Overcharge Ultimate */}
        {isUltReady && (
          <button
            onClick={onTriggerUltimate}
            className="w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 border border-purple-200 text-white flex flex-col items-center justify-center shadow-[0_0_22px_rgba(217,70,239,0.9)] animate-bounce active:scale-95 cursor-pointer"
            title="Discharge Ultimate Screen Blast"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span className="text-[8px] font-black font-mono">ULT</span>
          </button>
        )}

        {/* Shield */}
        <button
          {...handleTouch('shield')}
          className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-all active:scale-95 touch-none cursor-pointer border ${
            activeKeys.shield
              ? 'bg-cyan-500/90 border-cyan-300 scale-95 shadow-[0_0_20px_rgba(6,182,212,0.9)]'
              : 'bg-slate-900/80 border-cyan-800/70 hover:bg-slate-800/80'
          }`}
          aria-label="Kinetic Shield"
        >
          <Shield className="w-5 h-5 text-cyan-300" />
          <span className="text-[9px] font-mono tracking-tighter text-cyan-200 uppercase font-bold mt-0.5">
            Guard
          </span>
        </button>

        {/* Fire */}
        <button
          {...handleTouch('shoot')}
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-all active:scale-95 touch-none cursor-pointer border ${
            activeKeys.shoot
              ? 'bg-rose-500/95 border-rose-300 scale-95 shadow-[0_0_20px_rgba(244,63,94,0.9)]'
              : 'bg-slate-900/80 border-rose-800/70 hover:bg-slate-800/80'
          }`}
          aria-label="Fire Gun"
        >
          <Crosshair className="w-5 h-5 text-rose-300" />
          <span className="text-[9px] font-mono tracking-tighter text-rose-200 uppercase font-bold mt-0.5">
            Fire
          </span>
        </button>

        {/* Jump */}
        <button
          {...handleTouch('jump')}
          className={`w-15 h-15 sm:w-17 sm:h-17 rounded-2xl flex flex-col items-center justify-center text-white shadow-xl backdrop-blur-md transition-all active:scale-95 touch-none cursor-pointer border ${
            activeKeys.jump
              ? 'bg-emerald-500/95 border-emerald-300 scale-95 shadow-[0_0_20px_rgba(16,185,129,0.9)]'
              : 'bg-slate-900/80 border-emerald-800/70 hover:bg-slate-800/80'
          }`}
          aria-label="Jump / Double Jump"
        >
          <ArrowUp className="w-6 h-6 text-emerald-300" />
          <span className="text-[9px] font-mono tracking-tighter text-emerald-200 uppercase font-bold mt-0.5">
            Jump
          </span>
        </button>
      </div>
    </div>
  );
};
