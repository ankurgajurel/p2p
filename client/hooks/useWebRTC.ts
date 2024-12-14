import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

export const useWebRTC = (socket: Socket, roomId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const init = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      socket.emit("join-room", roomId);

      socket.on("user-connected", async () => {
        const offer = await peerConnection.current?.createOffer();
        await peerConnection.current?.setLocalDescription(offer);
        socket.emit("offer", offer, roomId);
      });

      socket.on("offer", async (offer) => {
        await peerConnection.current?.setRemoteDescription(offer);
        const answer = await peerConnection.current?.createAnswer();
        await peerConnection.current?.setLocalDescription(answer);
        socket.emit("answer", answer, roomId);
      });

      socket.on("answer", async (answer) => {
        await peerConnection.current?.setRemoteDescription(answer);
      });

      socket.on("ice-candidate", async (candidate) => {
        await peerConnection.current?.addIceCandidate(candidate);
      });

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      stream.getTracks().forEach((track) => {
        peerConnection.current?.addTrack(track, stream);
      });

      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };

      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate, roomId);
        }
      };
    };

    init();

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      peerConnection.current?.close();
    };
  }, [roomId, socket]);

  return { localStream, remoteStream };
};
