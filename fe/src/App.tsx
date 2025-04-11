// App.tsx
import { useRef, useEffect } from "react";
import useWebRTC from "./hooks/useWebRTC";

const App = () => {
  const { localStream, remoteStream } = useWebRTC();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      console.log("localStream", localStream);
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      console.log("remoteStream", remoteStream);
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="p-4 flex flex-col items-center gap-6">
      <h1 className="text-xl font-bold">WebRTC Video Chat</h1>
      <video
        ref={localVideoRef}
        autoPlay
        muted
        className="w-64 border rounded"
      />
      <video
        ref={remoteVideoRef}
        muted
        autoPlay
        className="w-64 border rounded"
      />
    </div>
  );
};

export default App;
