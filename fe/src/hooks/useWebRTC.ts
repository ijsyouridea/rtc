// hooks/useWebRTC.ts
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import createPeerConnection from "../utils/createPeerConnection";

const socket = io("https://rtc-m8p0.onrender.com", {
  transports: ["websocket"], // optional but helps
  reconnection: true,
});

const useWebRTC = () => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);

  const streamTracksToPeer = async (
    pc: RTCPeerConnection,
    localStream: Promise<MediaStream | undefined>
  ) => {
    const stream = await localStream;
    stream?.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
  };
  useEffect(() => {
    const start = async () => {
      try {
        console.log("Requesting media permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log("Media stream obtained");
        setLocalStream(stream);
        console.log("Emitting join event");
        socket.emit("join");
        return stream;
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    const stream = start();

    socket.on("offer", async ({ sdp }) => {
      console.log("offer");

      const pc = createPeerConnection(handleRemoteStream, handleIceCandidate);
      peerRef.current = pc;

      streamTracksToPeer(pc, stream);

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { sdp: answer });
    });

    socket.on("answer", async ({ sdp }) => {
      console.log("answer");
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      console.log("ice-candidate");
      if (!peerRef.current) return;
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("ready", async () => {
      console.log("ready");
      const pc = createPeerConnection(handleRemoteStream, handleIceCandidate);
      peerRef.current = pc;

      streamTracksToPeer(pc, stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { sdp: offer });
    });

    // return () => {
    //   socket.disconnect();
    // };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
  };

  const handleIceCandidate = (candidate: RTCIceCandidate) => {
    console.log({ candidate });
    socket.emit("ice-candidate", { candidate });
  };

  return { localStream, remoteStream };
};

export default useWebRTC;
