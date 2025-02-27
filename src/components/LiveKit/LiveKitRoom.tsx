import React, { useCallback, useEffect, useState } from 'react';
import {
  LiveKitRoom as LiveKitRoomComponent,
  VideoConference,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';
import axios from 'axios';

interface LiveKitRoomProps {
  roomName: string;
  participantName: string;
  onError?: (error: Error) => void;
}

export const LiveKitRoom: React.FC<LiveKitRoomProps> = ({
  roomName,
  participantName,
  onError
}) => {
  const [token, setToken] = useState<string>('');

  const fetchToken = useCallback(async () => {
    try {
      const response = await axios.post('/api/livekit/token', {
        roomName,
        participantName,
      });
      setToken(response.data.token);
    } catch (error) {
      console.error('Error fetching token:', error);
      if (onError) {
        onError(error as Error);
      }
    }
  }, [roomName, participantName, onError]);

  useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  if (!token) {
    return <div>Loading...</div>;
  }

  return (
    <LiveKitRoomComponent
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      connect={true}
      video={true}
      audio={true}
    >
      <VideoConference />
      <RoomAudioRenderer />
    </LiveKitRoomComponent>
  );
};

export default LiveKitRoom;
