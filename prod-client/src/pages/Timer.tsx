import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerProps {
  time: number;
  isRunning: boolean;
  mode: "pomodoro" | "shortBreak" | "longBreak";
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onModeChange: (mode: "pomodoro" | "shortBreak" | "longBreak") => void;
}

const Timer: React.FC<TimerProps> = ({ time, isRunning, mode, onStart, onPause, onReset, onModeChange }) => {
  const modes = {
    pomodoro: { time: 1500, label: "Pomodoro", color: "text-red-400" },
    shortBreak: { time: 300, label: "Short Break", color: "text-green-400" },
    longBreak: { time: 900, label: "Long Break", color: "text-cyan-400" },
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => ((modes[mode].time - time) / modes[mode].time) * 100;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
      <div className="flex flex-col items-center justify-center px-4">
        {/* Mode Selector */}
        <div className="mb-8 flex gap-1 bg-gray-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-gray-700/50">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => onModeChange(key as "pomodoro" | "shortBreak" | "longBreak")}
              disabled={isRunning}
              className={`px-6 py-3 rounded-full text-sm font-medium ${mode === key ? "bg-gray-700 text-white shadow-md" : "text-gray-400 hover:text-gray-200"}`}
            >
              {modeData.label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative mb-8">
          <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className={modes[mode].color}
              strokeDasharray={`${2 * Math.PI * 54}`}
              strokeDashoffset={`${2 * Math.PI * 54 * (1 - getProgress() / 100)}`}
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-white font-mono tracking-wider mb-2">{formatTime(time)}</div>
            <div className={`text-lg font-medium ${modes[mode].color}`}>{modes[mode].label}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-6">
          <button onClick={onReset} className="w-14 h-14 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </button>
          <button onClick={isRunning ? onPause : onStart} className="w-20 h-20 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center">
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
        </div>

        {/* Status */}
        <div className="mt-6 text-center text-gray-300">
          {time === 0 ? "Time's up! ✨" : isRunning ? "Focus time..." : "Ready to start?"}
        </div>
      </div>
    </div>
  );
};

export default Timer;
