import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// In-memory room storage (for serverless, consider using Redis or database)
const rooms = new Map<string, any>();

// Create room
router.post('/', async (req: Request, res: Response) => {
  try {
    const { roomId, username, duration = 1500 } = req.body;

    if (!roomId || !username) {
      return res.status(400).json({ ok: false, error: 'Room ID and username are required' });
    }

    if (rooms.has(roomId)) {
      return res.status(409).json({ ok: false, error: 'Room already exists' });
    }

    const room = {
      roomId,
      participants: [username],
      duration,
      mode: 'pomodoro',
      remainingSeconds: duration,
      isRunning: false,
      createdAt: new Date().toISOString()
    };

    rooms.set(roomId, room);

    res.json({ 
      ok: true, 
      roomId, 
      state: room 
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ ok: false, error: 'Failed to create room' });
  }
});

// Join room
router.post('/:roomId/join', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const { username } = req.body;

    if (!roomId) {
      return res.status(400).json({ ok: false, error: 'Room ID is required' });
    }

    if (!username) {
      return res.status(400).json({ ok: false, error: 'Username is required' });
    }

    const room = rooms.get(roomId);
    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    if (room.participants.includes(username)) {
      return res.json({ 
        ok: true, 
        roomId, 
        state: room 
      });
    }

    room.participants.push(username);
    rooms.set(roomId, room);

    res.json({ 
      ok: true, 
      roomId, 
      state: room 
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ ok: false, error: 'Failed to join room' });
  }
});

// Get room state
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;

    if (!roomId) {
      return res.status(400).json({ ok: false, error: 'Room ID is required' });
    }

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    res.json({ 
      ok: true, 
      roomId, 
      state: room 
    });
  } catch (error) {
    console.error('Error getting room state:', error);
    res.status(500).json({ ok: false, error: 'Failed to get room state' });
  }
});

// Update room state (start, pause, reset, etc.)
router.post('/:roomId/:action', async (req: Request, res: Response) => {
  try {
    const { roomId, action } = req.params;

    if (!roomId) {
      return res.status(400).json({ ok: false, error: 'Room ID is required' });
    }

    const room = rooms.get(roomId);

    if (!room) {
      return res.status(404).json({ ok: false, error: 'Room not found' });
    }

    switch (action) {
      case 'start':
        room.isRunning = true;
        room.startTime = Date.now();
        break;
      case 'pause':
        room.isRunning = false;
        if (room.startTime) {
          const elapsed = Math.floor((Date.now() - room.startTime) / 1000);
          room.remainingSeconds = Math.max(0, room.remainingSeconds - elapsed);
        }
        break;
      case 'reset':
        room.isRunning = false;
        room.remainingSeconds = room.duration;
        room.startTime = undefined;
        break;
      default:
        return res.status(400).json({ ok: false, error: 'Invalid action' });
    }

    rooms.set(roomId, room);

    res.json({ 
      ok: true, 
      roomId, 
      state: room 
    });
  } catch (error) {
    console.error('Error updating room state:', error);
    res.status(500).json({ ok: false, error: 'Failed to update room state' });
  }
});

export default router;
