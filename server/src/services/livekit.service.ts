import { AccessToken, RoomServiceClient, CreateOptions } from 'livekit-server-sdk';

const livekitHost = process.env.LIVEKIT_HOST;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;

if (!livekitHost || !apiKey || !apiSecret) {
  throw new Error('LiveKit configuration is missing. Please check your environment variables.');
}

console.log('LiveKit Configuration:', {
  host: livekitHost,
  apiKey,
  // Don't log the secret
});

const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);

export async function createToken(roomName: string, userId: string): Promise<string> {
  console.log('Creating token for room:', roomName, 'userId:', userId);
  
  const at = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: userId, // Set display name same as identity
  });

  at.addGrant({ 
    roomJoin: true, 
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  
  const token = at.toJwt();
  console.log('Token created successfully');
  return token;
}

export async function createRoom(roomName: string): Promise<any> {
  try {
    console.log('Creating room:', roomName);
    const options: CreateOptions = {
      name: roomName,
      emptyTimeout: 10 * 60, // 10 minutes
      maxParticipants: 20,
    };

    const room = await roomService.createRoom(options);
    console.log('Created room successfully:', room.name);
    return room;
  } catch (error) {
    console.error('Error creating room:', error);
    throw error;
  }
}

export async function deleteRoom(roomName: string): Promise<void> {
  try {
    console.log('Deleting room:', roomName);
    await roomService.deleteRoom(roomName);
    console.log('Deleted room successfully');
  } catch (error) {
    console.error('Error deleting room:', error);
    throw error;
  }
}

export async function listRooms(): Promise<any[]> {
  try {
    console.log('Listing rooms');
    const rooms = await roomService.listRooms();
    console.log('Listed rooms successfully, count:', rooms.length);
    return rooms;
  } catch (error) {
    console.error('Error listing rooms:', error);
    throw error;
  }
}
