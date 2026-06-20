// src/lib/socket.ts

import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_API_URL;

let socket: Socket | null = null;

// Create/connect socket only once
export const connectIfNeeded = (): Socket => {
  if (!socket) {
    console.log("Connecting socket to:", SERVER_URL);
    socket = io(SERVER_URL, {
      autoConnect: false,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
    console.log("Socket connected:", socket?.id);
  });

  socket.on("connect_error", (err) => {
    console.error("Socket error:", err);
  });
  }

  if (!socket.connected) {
    socket.connect();
  }

  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper to emit with acknowledgment
export const emitWithAck = <T = any>(
  event: string,
  data: any
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const sock = connectIfNeeded();

    sock.emit(event, data, (response: any) => {
      if (response?.ok) {
        resolve(response);
      } else {
        reject(
          new Error(response?.error || "Request failed")
        );
      }
    });
  });
};

// -------------------------
// Room Management
// -------------------------

export const createRoom = async (data: {
  roomId: string;
  username: string;
  duration?: number;
}) => {
  return emitWithAck("create_room", data);
};

export const joinRoom = async (data: {
  roomId: string;
  username: string;
}) => {
  return emitWithAck("join_room", data);
};

export const leaveRoom = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit("leave_room", roomId);
};

export const requestSync = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit("request_sync", roomId);
};

// -------------------------
// Timer Controls
// -------------------------

export const startTimer = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit("start_timer", roomId);
};

export const pauseTimer = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit("pause_timer", roomId);
};

export const resetTimer = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit("reset_timer", roomId);
};

export const changeMode = (
  roomId: string,
  mode: "pomodoro" | "shortBreak" | "longBreak"
) => {
  const sock = connectIfNeeded();

  sock.emit("mode_change", {
    roomId,
    mode,
  });
};

export const adjustTime = (
  roomId: string,
  deltaSeconds: number
) => {
  const sock = connectIfNeeded();

  sock.emit("adjust_time", {
    roomId,
    deltaSeconds,
  });
};

// -------------------------
// Event Listeners
// -------------------------

export const onTimerUpdate = (
  callback: (data: any) => void
) => {
  const sock = connectIfNeeded();
  sock.on("timer_update", callback);
};

export const onPresenceUpdate = (
  callback: (data: any) => void
) => {
  const sock = connectIfNeeded();
  sock.on("presence_update", callback);
};

export const offTimerUpdate = (
  callback: (data: any) => void
) => {
  socket?.off("timer_update", callback);
};

export const offPresenceUpdate = (
  callback: (data: any) => void
) => {
  socket?.off("presence_update", callback);
};

// -------------------------
// Get Raw Socket
// -------------------------

export const getSocket = (): Socket | null => socket;