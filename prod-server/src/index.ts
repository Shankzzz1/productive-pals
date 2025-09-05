import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import userRoutes from "./routes/RegUserRoutes";
import taskRoutes  from "./routes/taskRoutes";
import focusRoutes from "./routes/focusRoutes";

const app = express();
const server = createServer(app);
const PORT = 5000;

connectDB();

// Middleware
app.use(express.json());
app.use(cors({


  origin: 'http://localhost:5173',
  credentials: true
}));

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});

// Room-based timer state management
interface RoomState {
  mode: 'pomodoro' | 'shortBreak' | 'longBreak';
  remainingSeconds: number;
  isRunning: boolean;
  startAtEpochMs?: number;
  baseDurationSeconds: number;
  participants: Set<string>;
  participantUsernames: Map<string, string>; // socketId -> username mapping
  roomName?: string;
}

const rooms = new Map<string, RoomState>();

const modeTimes: Record<'pomodoro' | 'shortBreak' | 'longBreak', number> = {
  pomodoro: 1500,
  shortBreak: 300,
  longBreak: 900,
};

// Helper functions
const getCurrentRemainingSeconds = (room: RoomState): number => {
  if (!room.isRunning || !room.startAtEpochMs) {
    return room.remainingSeconds;
  }
  const elapsed = Math.floor((Date.now() - room.startAtEpochMs) / 1000);
  return Math.max(0, room.remainingSeconds - elapsed);
};

const broadcastTimerUpdate = (roomId: string) => {
  const room = rooms.get(roomId);
  if (!room) return;
  
  const currentRemaining = getCurrentRemainingSeconds(room);
  io.to(roomId).emit('timer_update', {
    roomId,
    mode: room.mode,
    isRunning: room.isRunning,
    remainingSeconds: currentRemaining,
    baseDurationSeconds: room.baseDurationSeconds,
    startAtEpochMs: room.startAtEpochMs,
    participants: Array.from(room.participants),
    participantUsernames: Array.from(room.participantUsernames.values())
  });
};

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('create_room', async (data, ack) => {
    try {
      const { roomId, username, duration } = data;
      
      if (rooms.has(roomId)) {
        ack({ ok: false, error: 'Room already exists' });
        return;
      }

      const pomoDuration = duration || 1500; // default 25 minutes
      rooms.set(roomId, {
        mode: 'pomodoro',
        remainingSeconds: pomoDuration,
        isRunning: false,
        baseDurationSeconds: pomoDuration,
        participants: new Set([socket.id]),
        participantUsernames: new Map([[socket.id, username]])
      });

      socket.join(roomId);
      ack({ ok: true, roomId, state: rooms.get(roomId) });
      console.log(`Room ${roomId} created by ${username}`);
    } catch (error) {
      ack({ ok: false, error: 'Failed to create room' });
    }
  });

  socket.on('join_room', async (data, ack) => {
    try {
      const { roomId, username } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        ack({ ok: false, error: 'Room not found' });
        return;
      }

      room.participants.add(socket.id);
      room.participantUsernames.set(socket.id, username);
      socket.join(roomId);
      
      ack({ 
        ok: true, 
        state: {
          roomId,
          mode: room.mode,
          isRunning: room.isRunning,
          remainingSeconds: getCurrentRemainingSeconds(room),
          baseDurationSeconds: room.baseDurationSeconds,
          startAtEpochMs: room.startAtEpochMs,
          participants: Array.from(room.participants),
          participantUsernames: Array.from(room.participantUsernames.values())
        }
      });
      
      // Notify others about new participant
      socket.to(roomId).emit('presence_update', {
        participants: Array.from(room.participants),
        participantUsernames: Array.from(room.participantUsernames.values())
      });
      
      console.log(`${username} joined room ${roomId}`);
    } catch (error) {
      ack({ ok: false, error: 'Failed to join room' });
    }
  });

  socket.on('leave_room', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      room.participants.delete(socket.id);
      room.participantUsernames.delete(socket.id);
      socket.leave(roomId);
      
      if (room.participants.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        socket.to(roomId).emit('presence_update', {
          participants: Array.from(room.participants),
          participantUsernames: Array.from(room.participantUsernames.values())
        });
      }
    }
  });

  socket.on('request_sync', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit('timer_update', {
        roomId,
        mode: room.mode,
        isRunning: room.isRunning,
        remainingSeconds: getCurrentRemainingSeconds(room),
        baseDurationSeconds: room.baseDurationSeconds,
        startAtEpochMs: room.startAtEpochMs,
        participants: Array.from(room.participants),
        participantUsernames: Array.from(room.participantUsernames.values())
      });
    }
  });

  // Timer control events
  socket.on('start_timer', (roomId) => {
    const room = rooms.get(roomId);
    if (room && !room.isRunning) {
      room.isRunning = true;
      room.startAtEpochMs = Date.now();
      broadcastTimerUpdate(roomId);
    }
  });

  socket.on('pause_timer', (roomId) => {
    const room = rooms.get(roomId);
    if (room && room.isRunning) {
      room.remainingSeconds = getCurrentRemainingSeconds(room);
      room.isRunning = false;
      delete room.startAtEpochMs;
      broadcastTimerUpdate(roomId);
    }
  });

  socket.on('reset_timer', (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      room.remainingSeconds = modeTimes[room.mode];
      room.isRunning = false;
      delete room.startAtEpochMs;
      broadcastTimerUpdate(roomId);
    }
  });

  socket.on('mode_change', (data: { roomId: string; mode: 'pomodoro' | 'shortBreak' | 'longBreak' }) => {
    const { roomId, mode } = data;
    const room = rooms.get(roomId);
    if (room && mode in modeTimes) {
      room.mode = mode;
      room.remainingSeconds = modeTimes[mode];
      room.isRunning = false;
      delete room.startAtEpochMs;
      broadcastTimerUpdate(roomId);
    }
  });

  socket.on('adjust_time', (data) => {
    const { roomId, deltaSeconds } = data;
    const room = rooms.get(roomId);
    if (room) {
      room.remainingSeconds = Math.max(0, room.remainingSeconds + deltaSeconds);
      broadcastTimerUpdate(roomId);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Clean up all rooms this socket was in
    for (const [roomId, room] of rooms.entries()) {
      if (room.participants.has(socket.id)) {
        room.participants.delete(socket.id);
        room.participantUsernames.delete(socket.id);
        if (room.participants.size === 0) {
          rooms.delete(roomId);
          console.log(`Room ${roomId} deleted (empty)`);
        } else {
          socket.to(roomId).emit('presence_update', {
            participants: Array.from(room.participants),
            participantUsernames: Array.from(room.participantUsernames.values())
          });
        }
      }
    }
  });
});

// Simple route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/focus", focusRoutes);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
