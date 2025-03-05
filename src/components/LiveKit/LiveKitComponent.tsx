import { useEffect, useState } from "react";
import { Room, createLocalTracks } from "livekit-client";
import { LiveKitRoom } from "@livekit/components-react";

const LIVEKIT_URL =
  import.meta.env.LIVEKIT_URL || "https://livekit.talkai.site";
const API_URL = import.meta.env.VITE_API_URL;
interface LiveKitComponentProps {
  roomName: string;
  userName: string;
}

const LiveKitComponent = ({ roomName, userName }: LiveKitComponentProps) => {
  const [token, setToken] = useState(null);
  const [room, setRoom] = useState<Room | null>(null);
  console.log("LIVEKIT_URL", LIVEKIT_URL);
  console.log("API_URL", API_URL);
  useEffect(() => {
    const fetchToken = async () => {
      const res = await fetch(`${API_URL}/livekit/get-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, userName }),
      });

      const data = await res.json();
      console.log("data", data);
      setToken(data.token);
    };

    fetchToken();
  }, [roomName, userName]);

  //   useEffect(() => {
  //     if (token) {
  //       const room = new Room();
  //       room.connect(LIVEKIT_URL, token).then(() => {
  //         createLocalTracks({ audio: true, video: true }).then((tracks) => {
  //           tracks.forEach((track) => room.localParticipant.publishTrack(track));
  //         });
  //       });

  //       setRoom(room);
  //     }
  //   }, [token]);
  useEffect(() => {
    if (token) {
      const room = new Room();

      room.on("connected", () => console.log("Connected to LiveKit"));
      room.on("disconnected", () => console.log("Disconnected from LiveKit"));
      //   room.on("trackSubscribed", (track, publication, participant) => {
      //     console.log(
      //       `Track subscribed: ${track.kind} from ${participant.identity}`
      //     );
      //   });
      room.on("trackPublished", (publication, participant) => {
        console.log(
          `Track published: ${publication.kind} by ${participant.identity}`
        );
      });
      room.on("trackSubscribed", (track) => {
        if (track.kind === "video") {
          const videoElement = document.createElement("video");
          videoElement.srcObject = new MediaStream([track.mediaStreamTrack]);
          console.log("videoElement", videoElement);
          document.body.appendChild(videoElement);
          videoElement.play();
        }
      });

      room
        .connect(LIVEKIT_URL, token)
        .then(() => {
          console.log("Connected successfully, publishing tracks...");
          createLocalTracks({ audio: true, video: true }).then((tracks) => {
            tracks.forEach((track) => {
              room.localParticipant.publishTrack(track);
            });
          });
        })
        .catch(console.error);

      setRoom(room);
    }
  }, [token]);

  console.log("room", room);
  return (
    <div>
      <h2>LiveKit Video Call</h2>
      {room && token && (
        <LiveKitRoom room={room} serverUrl={LIVEKIT_URL} token={token} />
      )}
    </div>
  );
};

export default LiveKitComponent;
