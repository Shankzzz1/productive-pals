import { io, Socket } from 'socket.io-client';

// Get server URL from environment or use default
const getServerUrl = () => {
  if (import.meta.env.PROD) {
    // In production, use the same domain (Vercel handles routing)
    return window.location.origin;
  }
  // In development, use localhost
  return 'http://localhost:5000';
};

// Socket.IO singleton
let socket: Socket | null = null;

export const connectIfNeeded = (): Socket => {
  if (!socket) {
    socket = io(getServerUrl(), {
      autoConnect: false,
      withCredentials: true
    });
  }
  
  if (!socket.connected) {
    socket.connect();
  }
  
  return socket;
};

export const disconnect = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Helper to emit with acknowledgment
export const emitWithAck = <T = any>(event: string, data: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    const sock = connectIfNeeded();
    sock.emit(event, data, (response: any) => {
      if (response?.ok) {
        resolve(response);
      } else {
        reject(new Error(response?.error || 'Request failed'));
      }
    });
  });
};

// Room management functions
export const createRoom = async (data: { roomId: string; username: string; duration?: number }) => {
  return emitWithAck('create_room', data);
};

export const joinRoom = async (data: { roomId: string; username: string }) => {
  return emitWithAck('join_room', data);
};

export const leaveRoom = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit('leave_room', roomId);
};

export const requestSync = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit('request_sync', roomId);
};

// Timer control functions
export const startTimer = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit('start_timer', roomId);
};

export const pauseTimer = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit('pause_timer', roomId);
};

export const resetTimer = (roomId: string) => {
  const sock = connectIfNeeded();
  sock.emit('reset_timer', roomId);
};

export const changeMode = (roomId: string, mode: 'pomodoro' | 'shortBreak' | 'longBreak') => {
  const sock = connectIfNeeded();
  sock.emit('mode_change', { roomId, mode });
};

export const adjustTime = (roomId: string, deltaSeconds: number) => {
  const sock = connectIfNeeded();
  sock.emit('adjust_time', { roomId, deltaSeconds });
};

// Event subscription helpers
export const onTimerUpdate = (callback: (data: any) => void) => {
  const sock = connectIfNeeded();
  sock.on('timer_update', callback);
};

export const onPresenceUpdate = (callback: (data: any) => void) => {
  const sock = connectIfNeeded();
  sock.on('presence_update', callback);
};

export const offTimerUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.off('timer_update', callback);
  }
};

export const offPresenceUpdate = (callback: (data: any) => void) => {
  if (socket) {
    socket.off('presence_update', callback);
  }
};

// Get the socket instance for direct event handling
export const getSocket = (): Socket | null => socket;
