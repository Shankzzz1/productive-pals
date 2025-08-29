import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus } from 'lucide-react';

interface AnimatedDigitProps {
  digit: string;
  index: number;
}

const AnimatedDigit: React.FC<AnimatedDigitProps> = ({ digit, index }) => {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
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
          isAnimating ? 'transform -translate-y-full opacity-0' : 'transform translate-y-0 opacity-100'
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

const DigitalTimer: React.FC = () => {
  const [time, setTime] = useState(300); // Default 5 minutes
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, time]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDigits = (timeString: string): string[] => {
    return timeString.split('').map(char => char === ':' ? ':' : char);
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(300); // Reset to 5 minutes
  };

  const handleAdjustTime = (delta: number) => {
    if (!isRunning) {
      setTime(prevTime => Math.max(0, prevTime + delta));
    }
  };

  const handleToggle = () => {
    isRunning ? handlePause() : handleStart();
  };

  const timeString = formatTime(time);
  const digits = getDigits(timeString);

  return (
    <div className="w-full">
      <div className="text-center space-y-3">
        <h2 className="text-base font-semibold text-gray-800">Focus Timer</h2>
        
        {/* Compact Digital Display */}
        <div className="bg-black text-green-400 rounded-lg p-3 shadow-inner">
          <div className="flex items-center justify-center space-x-1">
            {digits.map((digit, index) => (
              digit === ':' ? (
                <div key={index} className="text-lg font-mono font-bold px-1 animate-pulse">:</div>
              ) : (
                <AnimatedDigit key={index} digit={digit} index={index} />
              )
            ))}
          </div>
        </div>

        {/* Compact Time Adjustment Buttons */}
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => handleAdjustTime(-60)}
            disabled={isRunning}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => handleAdjustTime(-10)}
            disabled={isRunning}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            -10s
          </button>
          <button
            onClick={() => handleAdjustTime(10)}
            disabled={isRunning}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            +10s
          </button>
          <button
            onClick={() => handleAdjustTime(60)}
            disabled={isRunning}
            className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        {/* Compact Control Buttons */}
        <div className="flex justify-center space-x-2">
          <button
            onClick={handleToggle}
            className={`px-3 py-2 text-sm font-medium rounded transition-all duration-200 ${
              isRunning 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3 h-3 mr-1 inline" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-3 h-3 mr-1 inline" />
                Start
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 text-sm font-medium border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="w-3 h-3 mr-1 inline" />
            Reset
          </button>
        </div>

        {/* Status - Compact */}
        <div className="text-xs text-gray-500 min-h-[16px]">
          {time === 0 ? (
            <span className="text-red-500 font-semibold animate-pulse">Time's Up!</span>
          ) : isRunning ? (
            <span className="text-green-500">Running...</span>
          ) : (
            <span>Paused</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalTimer;