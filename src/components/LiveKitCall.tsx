import {
  VideoConference,
  GridLayout,
  ParticipantTile,
  RoomAudioRenderer,
  ControlBar,
  useRoomContext,
  useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

interface LiveKitCallProps {
  token: string;
  roomName: string;
}

export default function LiveKitCall({ token }: LiveKitCallProps) {
  const [connected, setConnected] = useState(false);
  const room = useRoomContext();

  useEffect(() => {
    // Connect to the room
    room
      .connect(import.meta.env.VITE_LIVEKIT_URL, token)
      .then(() => setConnected(true))
      .catch((error) => console.error("Failed to connect to the room:", error));

    // Cleanup on unmount
    return () => {
      room.disconnect();
    };
  }, [room, token]);

  if (!connected) {
    return <div>Connecting to the room...</div>;
  }
  const tracks = useTracks();
  return (
    <VideoConference style={{ height: "100vh" }}>
      <GridLayout tracks={tracks || []}>
        <ParticipantTile />
      </GridLayout>
      <RoomAudioRenderer />
      <ControlBar />
    </VideoConference>
  );
}
