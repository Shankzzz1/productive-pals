import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getApiEndpoint, API_ENDPOINTS } from "@/lib/api";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

export default function useTimer() {
  const [time, setTime] = useState(1500); // default 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("pomodoro");

  const modeTimes: Record<Mode, number> = {
    pomodoro: 1500,
    shortBreak: 300,
    longBreak: 900,
  };

  // track how much time has actually been used
  const elapsedRef = useRef(0);

  // countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
        elapsedRef.current += 1;
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
      saveSession(true); // save when timer ends
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  // auto-save progress every 10 seconds (more frequent saves)
  useEffect(() => {
    if (!isRunning) return;
    const saveInterval = setInterval(() => {
      if (elapsedRef.current > 0) {
        saveSession(false); // partial progress
      }
    }, 10000); // Changed from 5000 to 10000ms (10 seconds)
    return () => clearInterval(saveInterval);
  }, [isRunning]);

  // Save focus session to backend
  const saveSession = async (completed: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        getApiEndpoint(API_ENDPOINTS.FOCUS),
        {
          duration: elapsedRef.current, // actual time spent
          mode,
          completed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(
        `✅ Focus session stored (${elapsedRef.current}s, completed: ${completed})`
      );

      if (completed) {
        elapsedRef.current = 0; // reset after full save
      }
    } catch (err) {
      console.error("❌ Failed to save session", err);
    }
  };

  // controls
  const onStart = () => setIsRunning(true);
  const onPause = () => {
    setIsRunning(false);
    // Save progress when paused (even small amounts)
    if (elapsedRef.current > 0) {
      saveSession(false);
    }
  };
  const onReset = () => {
    setIsRunning(false);
    setTime(modeTimes[mode]);
    elapsedRef.current = 0;
  };
  const onAdjustTime = (delta: number) => {
    setTime((prev) => Math.max(0, prev + delta));
  };
  const onModeChange = (newMode: Mode) => {
    setMode(newMode);
    setTime(modeTimes[newMode]);
    setIsRunning(false);
    elapsedRef.current = 0;
  };

  return {
    time,
    isRunning,
    mode,
    onStart,
    onPause,
    onReset,
    onAdjustTime,
    onModeChange,
  };
}
