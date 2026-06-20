// HTTP-based room management for serverless compatibility
import { getApiEndpoint } from './api';

interface RoomData {
  roomId: string;
  username: string;
  duration?: number;
}

interface RoomResponse {
  ok: boolean;
  roomId?: string;
  error?: string;
  state?: any;
}

// Create room via HTTP API
export const createRoomHTTP = async (data: RoomData): Promise<RoomResponse> => {
  try {
    const response = await fetch(getApiEndpoint('/rooms'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating room:', error);
    return { ok: false, error: 'Failed to create room' };
  }
};

// Join room via HTTP API
export const joinRoomHTTP = async (data: { roomId: string; username: string }): Promise<RoomResponse> => {
  try {
    const response = await fetch(getApiEndpoint(`/rooms/${data.roomId}/join`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: data.username }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error joining room:', error);
    return { ok: false, error: 'Failed to join room' };
  }
};

// Get room state via HTTP API
export const getRoomStateHTTP = async (roomId: string): Promise<RoomResponse> => {
  try {
    const response = await fetch(getApiEndpoint(`/rooms/${roomId}`));
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting room state:', error);
    return { ok: false, error: 'Failed to get room state' };
  }
};

// Update room state via HTTP API
export const updateRoomStateHTTP = async (roomId: string, action: string, data?: any): Promise<RoomResponse> => {
  try {
    const response = await fetch(getApiEndpoint(`/rooms/${roomId}/${action}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data || {}),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating room state:', error);
    return { ok: false, error: 'Failed to update room state' };
  }
};
