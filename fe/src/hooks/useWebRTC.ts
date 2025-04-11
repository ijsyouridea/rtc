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
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    start();

    socket.on("offer", async ({ sdp }) => {
      const pc = createPeerConnection(handleRemoteStream, handleIceCandidate);
      peerRef.current = pc;

      streamTracksToPeer(pc);

      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer", { sdp: answer });
    });

    socket.on("answer", async ({ sdp }) => {
      if (!peerRef.current) return;
      await peerRef.current.setRemoteDescription(
        new RTCSessionDescription(sdp)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      if (!peerRef.current) return;
      await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("ready", async () => {
      const pc = createPeerConnection(handleRemoteStream, handleIceCandidate);
      peerRef.current = pc;

      streamTracksToPeer(pc);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit("offer", { sdp: offer });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const streamTracksToPeer = (pc: RTCPeerConnection) => {
    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });
  };

  const handleRemoteStream = (stream: MediaStream) => {
    setRemoteStream(stream);
  };

  const handleIceCandidate = (candidate: RTCIceCandidate) => {
    socket.emit("ice-candidate", { candidate });
  };

  return { localStream, remoteStream };
};

export default useWebRTC;
