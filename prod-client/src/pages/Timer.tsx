import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export default function Timer() {
  const [time, setTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"pomodoro" | "shortBreak" | "longBreak">("pomodoro");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedRef = useRef(0); // total elapsed seconds in current chunk

  const modes = {
    pomodoro: { time: 1500, label: "Pomodoro", color: "text-red-400" },
    shortBreak: { time: 300, label: "Short Break", color: "text-green-400" },
    longBreak: { time: 900, label: "Long Break", color: "text-cyan-400" },
  };

  // Save elapsed session to backend
  const saveSession = async (elapsed: number) => {
    if (elapsed <= 0) return;

    try {
      const token = localStorage.getItem("token");
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch("http://localhost:5000/api/focus", {
        method: "POST",
        headers,
        body: JSON.stringify({ mode, duration: elapsed }),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("Failed to save session:", errData);
        return;
      }

      const data = await res.json();
      console.log("Session saved ✅", data);
    } catch (err) {
      console.error("Error saving session ❌", err);
    }
  };

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            elapsedRef.current += 1; // include last second
            saveSession(elapsedRef.current);
            elapsedRef.current = 0;
            return 0;
          }
          elapsedRef.current += 1;
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);

  const handlePause = () => {
    setIsRunning(false);
    if (elapsedRef.current > 0) saveSession(elapsedRef.current);
    elapsedRef.current = 0;
  };

  const handleReset = () => {
    if (elapsedRef.current > 0) saveSession(elapsedRef.current);
    elapsedRef.current = 0;
    setIsRunning(false);
    setTime(modes[mode].time);
  };

  const handleModeChange = (newMode: "pomodoro" | "shortBreak" | "longBreak") => {
    if (!isRunning) {
      if (elapsedRef.current > 0) saveSession(elapsedRef.current);
      elapsedRef.current = 0;
      setMode(newMode);
      setTime(modes[newMode].time);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgress = () => ((modes[mode].time - time) / modes[mode].time) * 100;

  const handleToggle = () => (isRunning ? handlePause() : handleStart());

  const handleQuickSwitch = () => handleModeChange(mode === "pomodoro" ? "shortBreak" : "pomodoro");

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Mode Selector */}
        <div className="mb-12 flex gap-1 bg-gray-800/80 backdrop-blur-sm rounded-full p-1 shadow-lg border border-gray-700/50">
          {Object.entries(modes).map(([key, modeData]) => (
            <button
              key={key}
              onClick={() => handleModeChange(key as "pomodoro" | "shortBreak" | "longBreak")}
              disabled={isRunning}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                mode === key
                  ? "bg-gray-700 text-white shadow-md"
                  : "text-gray-400 hover:text-gray-200 disabled:opacity-50"
              }`}
            >
              {modeData.label}
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative mb-12">
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
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-6xl font-light text-white font-mono tracking-wider mb-2">{formatTime(time)}</div>
            <div className={`text-lg font-medium ${modes[mode].color}`}>{modes[mode].label}</div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-6">
          <button
            onClick={handleReset}
            className="w-14 h-14 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-all duration-200 flex items-center justify-center"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          <button
            onClick={handleToggle}
            disabled={time === 0}
            className="w-20 h-20 rounded-full bg-gray-800 text-white shadow-lg hover:shadow-xl hover:scale-105 hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 border border-gray-600 flex items-center justify-center"
          >
            {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={handleQuickSwitch}
            disabled={isRunning}
            className="w-14 h-14 rounded-full text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 disabled:opacity-30 transition-all duration-200 flex items-center justify-center"
          >
            <div className="w-6 h-6 rounded-full border-2 border-current"></div>
          </button>
        </div>

        {/* Status Text */}
        <div className="mt-8 text-center">
          {time === 0 ? (
            <p className="text-2xl font-light text-gray-300 animate-pulse">Time's up! ✨</p>
          ) : isRunning ? (
            <p className="text-lg text-gray-400">Focus time...</p>
          ) : (
            <p className="text-lg text-gray-400">Ready to start?</p>
          )}
        </div>
      </div>
    </div>
  );
}
