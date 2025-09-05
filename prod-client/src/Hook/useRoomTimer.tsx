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

  // Local countdown effect for smooth UI updates
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsRunning(false);
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, time]);

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
    };

    const handlePresenceUpdate = (data: any) => {
      setParticipants(data.participants || []);
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
    // This is the original useTimer logic for non-room usage
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
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isRunning, time]);

    // auto-save progress every 5 seconds (original logic)
    useEffect(() => {
      if (!isRunning) return;
      const saveInterval = setInterval(() => {
        if (elapsedRef.current > 0) {
          // Save session logic would go here
          console.log(`Local timer progress: ${elapsedRef.current}s`);
        }
      }, 5000);
      return () => clearInterval(saveInterval);
    }, [isRunning]);

    const onStart = () => setIsRunning(true);
    const onPause = () => setIsRunning(false);
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
    }
  };

  const onReset = () => {
    if (roomId) {
      socketResetTimer(roomId);
    }
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
    onStart,
    onPause,
    onReset,
    onAdjustTime,
    onModeChange,
  };
}
