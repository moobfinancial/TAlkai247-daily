import React from 'react';
import {
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface LiveKitCallProps {
  token: string;
  roomName: string;
}

export default function LiveKitCall({ token, roomName }: LiveKitCallProps) {
  return (
    <VideoConference
      token={token}
      serverUrl={import.meta.env.VITE_LIVEKIT_URL}
      style={{ height: '100vh' }}
    >
      <GridLayout>
        <ParticipantTile />
      </GridLayout>
      <RoomAudioRenderer />
      <ControlBar />
    </VideoConference>
  );
}
