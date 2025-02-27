import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Room, 
  RoomEvent, 
  RemoteParticipant, 
  LocalParticipant,
  VideoPresets,
  createLocalTracks,
  Track,
  RoomOptions,
  ConnectOptions,
  ConnectionQuality,
  ConnectionState
} from 'livekit-client';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function LiveKitRoom() {
  const { roomName } = useParams<{ roomName: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "Please log in to join a room",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const livekitToken = localStorage.getItem('livekitToken');
    if (!livekitToken || !roomName) {
      toast({
        title: "Error",
        description: "Invalid room or missing token",
        variant: "destructive"
      });
      navigate('/livekit-test');
      return;
    }

    const connectToRoom = async () => {
      try {
        const roomOptions: RoomOptions = {
          adaptiveStream: true,
          dynacast: true,
          videoCaptureDefaults: {
            resolution: VideoPresets.h720.resolution,
          },
          publishDefaults: {
            simulcast: true,
          },
        };

        const connectOptions: ConnectOptions = {
          autoSubscribe: true,
          rtcConfig: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:stun1.l.google.com:19302' },
              {
                urls: [`turn:${window.location.hostname}:7881`],
                username: 'devkey',
                credential: 'secret'
              },
              {
                urls: ['turn:turn.services.mozilla.com:3478'],
                username: 'devkey',
                credential: 'secret'
              },
              {
                urls: ['turn:turn.anyfirewall.com:443'],
                username: 'devkey',
                credential: 'secret'
              }
            ],
            iceTransportPolicy: 'all',
            bundlePolicy: 'max-bundle',
            rtcpMuxPolicy: 'require',
            iceCandidatePoolSize: 10
          },
          publishDefaults: {
            simulcast: true,
            videoSimulcastLayers: [
              { width: 1280, height: 720, fps: 30, encoding: 'h', maxBitrate: 3000000 },
              { width: 640, height: 360, fps: 30, encoding: 'm', maxBitrate: 1000000 },
              { width: 320, height: 180, fps: 30, encoding: 'l', maxBitrate: 200000 }
            ],
          }
        };

        console.log('Creating room with options:', roomOptions);
        const room = new Room(roomOptions);

        const handleConnectionStateChange = async (state: ConnectionState) => {
          console.log('Connection state changed:', state);
          if (state === ConnectionState.Disconnected) {
            // Wait a bit before attempting reconnection
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (room && !room.isConnected) {
              console.log('Attempting to reconnect...');
              try {
                await room.connect(import.meta.env.VITE_LIVEKIT_URL, livekitToken, connectOptions);
                console.log('Reconnection successful');
              } catch (error) {
                console.error('Reconnection failed:', error);
                // Try one more time with a fresh room instance
                try {
                  const newRoom = new Room(roomOptions);
                  await newRoom.connect(import.meta.env.VITE_LIVEKIT_URL, livekitToken, connectOptions);
                  console.log('Reconnection successful with new room instance');
                  setRoom(newRoom);
                } catch (retryError) {
                  console.error('Final reconnection attempt failed:', retryError);
                  toast({
                    title: "Connection Error",
                    description: "Failed to reconnect to the room. Please try rejoining.",
                    variant: "destructive"
                  });
                  navigate('/livekit-test');
                }
              }
            }
          }
        };

        room
          .on(RoomEvent.Connected, () => {
            console.log('Room connected event fired');
            setIsConnected(true);
          })
          .on(RoomEvent.Disconnected, () => {
            console.log('Room disconnected event fired');
            setIsConnected(false);
          })
          .on(RoomEvent.ParticipantConnected, (participant) => {
            console.log('Participant connected:', participant.identity);
            updateParticipants(room);
          })
          .on(RoomEvent.ParticipantDisconnected, (participant) => {
            console.log('Participant disconnected:', participant.identity);
            updateParticipants(room);
          })
          .on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
            console.log('Track subscribed:', track.kind, 'from participant:', participant.identity);
            attachTrack(track, participant);
          })
          .on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
            console.log('Track unsubscribed:', track.kind, 'from participant:', participant.identity);
            detachTrack(track);
          })
          .on(RoomEvent.ConnectionQualityChanged, (quality: ConnectionQuality, participant) => {
            console.log('Connection quality changed:', quality, 'for participant:', participant?.identity);
          })
          .on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange)
          .on(RoomEvent.MediaDevicesError, (error: Error) => {
            console.error('Media device error:', error);
            toast({
              title: "Media Error",
              description: "Failed to access camera or microphone. Please check your permissions.",
              variant: "destructive"
            });
          });

        const url = import.meta.env.VITE_LIVEKIT_URL;
        console.log('Connecting to LiveKit URL:', url);
        await room.connect(url, livekitToken, connectOptions);
        console.log('Connected to room:', room.name);
        setRoom(room);
        updateParticipants(room);

      } catch (error) {
        console.error('Error connecting to room:', error);
        toast({
          title: "Error",
          description: "Failed to connect to room. Please try again.",
          variant: "destructive"
        });
        navigate('/livekit-test');
      }
    };

    connectToRoom();

    return () => {
      if (room) {
        console.log('Disconnecting from room');
        room.disconnect();
      }
    };
  }, [roomName, navigate, toast]);

  const updateParticipants = (room: Room) => {
    if (!room || !room.participants) {
      console.log('Room or participants not available yet');
      return;
    }
    
    const remoteParticipants = Array.from(room.participants.values());
    const allParticipants = room.localParticipant ? [room.localParticipant, ...remoteParticipants] : remoteParticipants;
    setParticipants(allParticipants);
  };

  const attachTrack = (track: Track, participant: RemoteParticipant | LocalParticipant) => {
    // Create a container for the track if it doesn't exist
    let container = document.getElementById(`track-${participant.identity}-${track.sid}`);
    if (!container) {
      container = document.createElement('div');
      container.id = `track-${participant.identity}-${track.sid}`;
      document.getElementById('tracks-container')?.appendChild(container);
    }

    // Attach the track
    const element = track.attach();
    container.appendChild(element);

    // Add some styling based on track type
    if (track.kind === Track.Kind.Video) {
      element.style.width = '100%';
      element.style.height = '100%';
      element.style.objectFit = 'cover';
    }
  };

  const detachTrack = (track: Track) => {
    track.detach();
  };

  const toggleCamera = async () => {
    if (!room?.localParticipant) return;

    try {
      if (isCameraEnabled) {
        await room.localParticipant.setCameraEnabled(false);
      } else {
        await room.localParticipant.setCameraEnabled(true);
      }
      setIsCameraEnabled(!isCameraEnabled);
    } catch (error) {
      console.error('Error toggling camera:', error);
      toast({
        title: "Error",
        description: "Failed to toggle camera",
        variant: "destructive"
      });
    }
  };

  const toggleMic = async () => {
    if (!room?.localParticipant) return;

    try {
      if (isMicEnabled) {
        await room.localParticipant.setMicrophoneEnabled(false);
      } else {
        await room.localParticipant.setMicrophoneEnabled(true);
      }
      setIsMicEnabled(!isMicEnabled);
    } catch (error) {
      console.error('Error toggling microphone:', error);
      toast({
        title: "Error",
        description: "Failed to toggle microphone",
        variant: "destructive"
      });
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Connecting to room...</h2>
          <p className="text-gray-400">Please wait while we establish the connection.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Room: {roomName}</h1>
        
        <div className="flex space-x-4 mb-4">
          <Button 
            onClick={toggleCamera}
            variant={isCameraEnabled ? "default" : "secondary"}
          >
            {isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
          </Button>
          
          <Button 
            onClick={toggleMic}
            variant={isMicEnabled ? "default" : "secondary"}
          >
            {isMicEnabled ? 'Disable Mic' : 'Enable Mic'}
          </Button>
        </div>

        <div id="tracks-container" className="grid grid-cols-2 gap-4">
          {participants.map((participant) => (
            <div 
              key={participant.identity} 
              className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative"
            >
              <div className="absolute bottom-2 left-2 text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                {participant.identity} {participant === room?.localParticipant ? '(You)' : ''}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
