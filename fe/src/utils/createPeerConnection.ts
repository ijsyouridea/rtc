// utils/createPeerConnection.ts
const createPeerConnection = (
  onTrack: (stream: MediaStream) => void,
  onIceCandidate: (candidate: RTCIceCandidate) => void
) => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) onIceCandidate(event.candidate);
  };

  peerConnection.ontrack = (event) => {
    const stream = event.streams[0] || new MediaStream([event.track]);
    onTrack(stream);
  };
  peerConnection.addEventListener("icegatheringstatechange", () => {
    console.log("❄️ ICE gathering state:", peerConnection.iceGatheringState);
  });

  return peerConnection;
};

export default createPeerConnection;
