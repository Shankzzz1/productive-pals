import React from "react";
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react";

interface DigitalTimerProps {
  time: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAdjustTime: (newTime: number) => void;
}

interface AnimatedDigitProps {
  digit: string;
  index: number;
}

const AnimatedDigit: React.FC<AnimatedDigitProps> = ({ digit, index }) => {
  const [currentDigit, setCurrentDigit] = React.useState(digit);
  const [isAnimating, setIsAnimating] = React.useState(false);

  React.useEffect(() => {
    if (currentDigit !== digit) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setCurrentDigit(digit);
        setIsAnimating(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [digit, currentDigit]);

  return (
    <div className="relative inline-block w-6 h-8 overflow-hidden">
      <div
        className={`absolute inset-0 flex items-center justify-center text-lg font-mono font-bold transition-all duration-300 ${
          isAnimating ? "transform -translate-y-full opacity-0" : "transform translate-y-0 opacity-100"
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        {currentDigit}
      </div>
      {isAnimating && (
        <div
          className="absolute inset-0 flex items-center justify-center text-lg font-mono font-bold transform translate-y-full animate-in slide-in-from-bottom duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {digit}
        </div>
      )}
    </div>
  );
};

const DigitalTimer: React.FC<DigitalTimerProps> = ({ time, isRunning, onStart, onPause, onReset, onAdjustTime }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const digits = formatTime(time).split("").map(c => (c === ":" ? ":" : c));

  return (
    <div className="w-full">
      <div className="text-center space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Focus Timer</h2>

        {/* Digital Display */}
        <div className="bg-black text-green-400 rounded-lg p-3 shadow-inner">
          <div className="flex items-center justify-center space-x-1">
            {digits.map((digit, index) =>
              digit === ":" ? (
                <div key={index} className="text-lg font-mono font-bold px-1 animate-pulse">
                  :
                </div>
              ) : (
                <AnimatedDigit key={index} digit={digit} index={index} />
              )
            )}
          </div>
        </div>

        {/* Adjust Time */}
        <div className="flex items-center justify-center space-x-1">
          <button onClick={() => onAdjustTime(-60)} disabled={isRunning} className="px-2 py-1 text-xs border rounded hover:bg-red-50 disabled:opacity-50">
            <Minus className="w-3 h-3" />
          </button>
          <button onClick={() => onAdjustTime(-10)} disabled={isRunning} className="px-2 py-1 text-xs border rounded hover:bg-red-50 disabled:opacity-50">
            -10s
          </button>
          <button onClick={() => onAdjustTime(10)} disabled={isRunning} className="px-2 py-1 text-xs border rounded hover:bg-green-50 disabled:opacity-50">
            +10s
          </button>
          <button onClick={() => onAdjustTime(60)} disabled={isRunning} className="px-2 py-1 text-xs border rounded hover:bg-green-50 disabled:opacity-50">
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-2">
          <button onClick={isRunning ? onPause : onStart} className={`px-3 py-2 text-sm font-medium rounded ${isRunning ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
            {isRunning ? <><Pause className="w-3 h-3 mr-1 inline"/>Pause</> : <><Play className="w-3 h-3 mr-1 inline"/>Start</>}
          </button>
          <button onClick={onReset} className="px-3 py-2 text-sm font-medium border rounded hover:bg-gray-50">
            <RotateCcw className="w-3 h-3 mr-1 inline"/>Reset
          </button>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500 min-h-[16px]">
          {time === 0 ? <span className="text-red-500 font-semibold animate-pulse">Time's Up!</span> : isRunning ? <span className="text-green-500">Running...</span> : <span>Paused</span>}
        </div>
      </div>
    </div>
  );
};

export default DigitalTimer;
