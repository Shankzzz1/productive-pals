import { useState, useEffect, useRef } from "react";
import { 
  connectIfNeeded, 
  onTimerUpdate, 
  offTimerUpdate, 
  onPresenceUpdate, 
  offPresenceUpdate,
  startTimer as socketStartTimer,
  pauseTimer as socketPauseTimer,
  resetTimer as socketResetTimer,
  changeMode as socketChangeMode,
  adjustTime as socketAdjustTime,
  requestSync
} from "../lib/socket";
import axios from "axios";

type Mode = "pomodoro" | "shortBreak" | "longBreak";

interface UseRoomTimerProps {
  roomId?: string;
  username?: string;
}

export default function useRoomTimer({ roomId, username }: UseRoomTimerProps = {}) {
  const [time, setTime] = useState(1500); // default 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("pomodoro");
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantUsernames, setParticipantUsernames] = useState<string[]>([]);

  const modeTimes: Record<Mode, number> = {
    pomodoro: 1500,
    shortBreak: 300,
    longBreak: 900,
  };

  // Track server state for real-time sync
  const serverStateRef = useRef<{
    remainingSeconds: number;
    isRunning: boolean;
    mode: Mode;
    startAtEpochMs?: number;
  }>({
    remainingSeconds: 1500,
    isRunning: false,
    mode: "pomodoro"
  });

  // Track elapsed time for saving focus sessions
  const elapsedRef = useRef(0);

  // Save focus session to backend
  const saveSession = async (completed: boolean) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5000/api/focus",
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

  // Local countdown effect for smooth UI updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev - 1;
          elapsedRef.current += 1; // Track elapsed time
          if (newTime <= 0) {
            setIsRunning(false);
            // Save when timer completes
            if (elapsedRef.current > 0) {
              saveSession(true);
            }
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

  // Auto-save progress every 10 seconds for room timers
  useEffect(() => {
    if (!isRunning || !roomId) return;
    const saveInterval = setInterval(() => {
      if (elapsedRef.current > 0) {
        saveSession(false); // partial progress
      }
    }, 10000);
    return () => clearInterval(saveInterval);
  }, [isRunning, roomId]);

  // Handle timer updates from server
  useEffect(() => {
    if (!roomId) return;

    const handleTimerUpdate = (data: any) => {
      if (data.roomId !== roomId) return;

      serverStateRef.current = {
        remainingSeconds: data.remainingSeconds,
        isRunning: data.isRunning,
        mode: data.mode,
        startAtEpochMs: data.startAtEpochMs
      };

      setMode(data.mode);
      setIsRunning(data.isRunning);
      setTime(data.remainingSeconds);
      setParticipants(data.participants || []);
      setParticipantUsernames(data.participantUsernames || []);
    };

    const handlePresenceUpdate = (data: any) => {
      setParticipants(data.participants || []);
      setParticipantUsernames(data.participantUsernames || []);
    };

    // Connect and subscribe to events
    connectIfNeeded();
    onTimerUpdate(handleTimerUpdate);
    onPresenceUpdate(handlePresenceUpdate);

    // Request initial sync
    requestSync(roomId);

    return () => {
      offTimerUpdate(handleTimerUpdate);
      offPresenceUpdate(handlePresenceUpdate);
    };
  }, [roomId]);

  // If no roomId, fall back to local timer behavior
  if (!roomId) {
    // Use the existing elapsedRef and saveSession from above
    // countdown effect for local timer
    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;
      if (isRunning && time > 0) {
        interval = setInterval(() => {
          setTime((prev) => prev - 1);
          elapsedRef.current += 1;
        }, 1000);
      } else if (time === 0) {
        setIsRunning(false);
        // Save when timer completes
        if (elapsedRef.current > 0) {
          saveSession(true);
        }
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isRunning, time]);

    // auto-save progress every 10 seconds for local timer
    useEffect(() => {
      if (!isRunning) return;
      const saveInterval = setInterval(() => {
        if (elapsedRef.current > 0) {
          saveSession(false); // partial progress
        }
      }, 10000);
      return () => clearInterval(saveInterval);
    }, [isRunning]);

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
      participants: [],
      participantUsernames: [],
      onStart,
      onPause,
      onReset,
      onAdjustTime,
      onModeChange,
    };
  }

  // Room-based timer controls
  const onStart = () => {
    if (roomId) {
      socketStartTimer(roomId);
    }
  };

  const onPause = () => {
    if (roomId) {
      socketPauseTimer(roomId);
      // Save progress when paused (even small amounts) for room timers
      if (elapsedRef.current > 0) {
        saveSession(false);
      }
    }
  };

  const onReset = () => {
    if (roomId) {
      socketResetTimer(roomId);
    }
    elapsedRef.current = 0; // Reset elapsed time
  };

  const onAdjustTime = (delta: number) => {
    if (roomId) {
      socketAdjustTime(roomId, delta);
    }
  };

  const onModeChange = (newMode: Mode) => {
    if (roomId) {
      socketChangeMode(roomId, newMode);
    }
  };

  return {
    time,
    isRunning,
    mode,
    participants,
    participantUsernames,
    onStart,
    onPause,
    onReset,
    onAdjustTime,
    onModeChange,
  };
}
