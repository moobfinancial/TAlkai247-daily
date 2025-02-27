import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { wrapAsync } from '../types/route-handlers';
import { createToken, createRoom, deleteRoom, listRooms } from '../services/livekit.service';
import { Request, Response } from 'express';

const router = Router();

// Create a token for a room
router.post('/token/:roomName', authenticate, wrapAsync(async (req: Request, res: Response) => {
  const roomName = req.params.roomName;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = await createToken(roomName, userId);
  res.status(200).json({ token });
}));

// Create a room
router.post('/room/:roomName', authenticate, wrapAsync(async (req: Request, res: Response) => {
  const roomName = req.params.roomName;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const room = await createRoom(roomName);
  res.status(201).json(room);
}));

// List all rooms
router.get('/rooms', authenticate, wrapAsync(async (_req: Request, res: Response) => {
  const rooms = await listRooms();
  res.status(200).json(rooms);
}));

// Delete a room
router.delete('/rooms/:roomName', authenticate, wrapAsync(async (req: Request, res: Response) => {
  const roomName = req.params.roomName;
  await deleteRoom(roomName);
  res.status(200).json({ message: 'Room deleted successfully' });
}));

export default router;
