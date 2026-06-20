import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/RegUserRoutes";
import taskRoutes from "./routes/taskRoutes";
import focusRoutes from "./routes/focusRoutes";
import roomRoutes from "./routes/roomRoutes";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 5000;

// Database connection
connectDB();

// Allowed origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);


// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// -------------------------------
// ROOM STATE
// -------------------------------

interface RoomState {
  mode: "pomodoro" | "shortBreak" | "longBreak";
  remainingSeconds: number;
  isRunning: boolean;
  startAtEpochMs?: number;
  baseDurationSeconds: number;
  participants: Set<string>;
  participantUsernames: Map<string, string>;
  roomName?: string;
}

const rooms = new Map<string, RoomState>();

const modeTimes: Record<
  "pomodoro" | "shortBreak" | "longBreak",
  number
> = {
  pomodoro: 1500,
  shortBreak: 300,
  longBreak: 900,
};

// -------------------------------
// HELPERS
// -------------------------------

const getCurrentRemainingSeconds = (room: RoomState): number => {
  if (!room.isRunning || !room.startAtEpochMs) {
    return room.remainingSeconds;
  }

  const elapsed = Math.floor(
    (Date.now() - room.startAtEpochMs) / 1000
  );

  return Math.max(0, room.remainingSeconds - elapsed);
};

const broadcastTimerUpdate = (roomId: string) => {
  const room = rooms.get(roomId);

  if (!room) return;

  io.to(roomId).emit("timer_update", {
    roomId,
    mode: room.mode,
    isRunning: room.isRunning,
    remainingSeconds: getCurrentRemainingSeconds(room),
    baseDurationSeconds: room.baseDurationSeconds,
    startAtEpochMs: room.startAtEpochMs,
    participants: Array.from(room.participants),
    participantUsernames: Array.from(
      room.participantUsernames.values()
    ),
  });
};

// -------------------------------
// SOCKET.IO EVENTS
// -------------------------------

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Create Room
  socket.on("create_room", (data, ack) => {
    try {
      
      const { roomId, username, duration } = data;
      console.log("CREATE ROOM", roomId);

      if (rooms.has(roomId)) {
        ack({
          ok: false,
          error: "Room already exists",
        });
        return;
      }

      const pomoDuration = duration || 1500;

      rooms.set(roomId, {
        mode: "pomodoro",
        remainingSeconds: pomoDuration,
        isRunning: false,
        baseDurationSeconds: pomoDuration,
        participants: new Set([socket.id]),
        participantUsernames: new Map([
          [socket.id, username],
        ]),
      });

      socket.join(roomId);

      ack({
        ok: true,
        roomId,
        state: rooms.get(roomId),
      });

      console.log(
        `Room ${roomId} created by ${username}`
      );
    } catch (error) {
      ack({
        ok: false,
        error: "Failed to create room",
      });
    }
  });

  // Join Room
  socket.on("join_room", (data, ack) => {
    try {
      const { roomId, username } = data;
      console.log("JOIN ROOM", roomId);

      const room = rooms.get(roomId);

      if (!room) {
        ack({
          ok: false,
          error: "Room not found",
        });
        return;
      }

      room.participants.add(socket.id);
      room.participantUsernames.set(
        socket.id,
        username
      );

      socket.join(roomId);

      ack({
        ok: true,
        state: {
          roomId,
          mode: room.mode,
          isRunning: room.isRunning,
          remainingSeconds:
            getCurrentRemainingSeconds(room),
          baseDurationSeconds:
            room.baseDurationSeconds,
          startAtEpochMs: room.startAtEpochMs,
          participants: Array.from(room.participants),
          participantUsernames: Array.from(
            room.participantUsernames.values()
          ),
        },
      });

      socket.to(roomId).emit("presence_update", {
        participants: Array.from(room.participants),
        participantUsernames: Array.from(
          room.participantUsernames.values()
        ),
      });

      console.log(
        `${username} joined room ${roomId}`
      );
    } catch (error) {
      ack({
        ok: false,
        error: "Failed to join room",
      });
    }
  });

  // Leave Room
  socket.on("leave_room", (roomId) => {
    const room = rooms.get(roomId);

    if (!room) return;

    room.participants.delete(socket.id);
    room.participantUsernames.delete(socket.id);

    socket.leave(roomId);

    if (room.participants.size === 0) {
      rooms.delete(roomId);
      return;
    }

    socket.to(roomId).emit("presence_update", {
      participants: Array.from(room.participants),
      participantUsernames: Array.from(
        room.participantUsernames.values()
      ),
    });
  });

  // Sync Request
  socket.on("request_sync", (roomId) => {
    const room = rooms.get(roomId);

    if (!room) return;

    socket.emit("timer_update", {
      roomId,
      mode: room.mode,
      isRunning: room.isRunning,
      remainingSeconds:
        getCurrentRemainingSeconds(room),
      baseDurationSeconds:
        room.baseDurationSeconds,
      startAtEpochMs: room.startAtEpochMs,
      participants: Array.from(room.participants),
      participantUsernames: Array.from(
        room.participantUsernames.values()
      ),
    });
  });

  // Start Timer
  socket.on("start_timer", (roomId) => {
    const room = rooms.get(roomId);
    console.log("START TIMER", roomId);

    if (!room || room.isRunning) return;

    room.isRunning = true;
    room.startAtEpochMs = Date.now();

    broadcastTimerUpdate(roomId);
  });

  // Pause Timer
  socket.on("pause_timer", (roomId) => {
    const room = rooms.get(roomId);

    if (!room || !room.isRunning) return;

    room.remainingSeconds =
      getCurrentRemainingSeconds(room);

    room.isRunning = false;

    delete room.startAtEpochMs;

    broadcastTimerUpdate(roomId);
  });

  // Reset Timer
  socket.on("reset_timer", (roomId) => {
    const room = rooms.get(roomId);

    if (!room) return;

    room.remainingSeconds =
      modeTimes[room.mode];

    room.isRunning = false;

    delete room.startAtEpochMs;

    broadcastTimerUpdate(roomId);
  });

  // Change Mode
  socket.on(
    "mode_change",
    (data: {
      roomId: string;
      mode:
        | "pomodoro"
        | "shortBreak"
        | "longBreak";
    }) => {
      const room = rooms.get(data.roomId);

      if (!room) return;

      room.mode = data.mode;
      room.remainingSeconds =
        modeTimes[data.mode];

      room.isRunning = false;

      delete room.startAtEpochMs;

      broadcastTimerUpdate(data.roomId);
    }
  );

  // Adjust Time
  socket.on("adjust_time", (data) => {
    const room = rooms.get(data.roomId);

    if (!room) return;

    room.remainingSeconds = Math.max(
      0,
      room.remainingSeconds + data.deltaSeconds
    );

    broadcastTimerUpdate(data.roomId);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(
      `User disconnected: ${socket.id}`
    );

    for (const [roomId, room] of rooms.entries()) {
      if (!room.participants.has(socket.id))
        continue;

      room.participants.delete(socket.id);
      room.participantUsernames.delete(socket.id);

      if (room.participants.size === 0) {
        rooms.delete(roomId);
      } else {
        socket.to(roomId).emit("presence_update", {
          participants: Array.from(
            room.participants
          ),
          participantUsernames: Array.from(
            room.participantUsernames.values()
          ),
        });
      }
    }
  });
});

// Health Check
app.get("/", (_req, res) => {
  res.send("Backend is running 🚀");
});

// Routes
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/focus", focusRoutes);
// app.use("/api/rooms", roomRoutes);

// Start Server
server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});