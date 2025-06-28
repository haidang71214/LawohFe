"use client";
import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { SocketContext } from "./socketProvider";
import { addToast } from "@heroui/react";
import { MediaConnection } from "peerjs";

interface VideoProviderInterface {
  openVideoCall: (callerId: string, calleeId: string) => void;
  closeVideoCall: () => void;
  handleAccept: (clientId: string) => void;
  handleReject: () => void;
  isAccept: boolean;
  isReject: boolean;
  isCalling: boolean;
  roomId: string;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export const VideoContextProvider = createContext<VideoProviderInterface | undefined>(undefined);

export default function VideoProvider({ children }: { children: React.ReactNode }) {
  const [isAccept, setIsAccept] = useState(false);
  const [isReject, setIsReject] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [roomId, setRoomId] = useState("");
  const { socket, peer, peerId } = useContext(SocketContext)!;
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const currentCall = useRef<MediaConnection | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Define getMediaStream outside useEffect
  const getMediaStream = async (): Promise<MediaStream | null> => {
    if (mediaStreamRef.current) return mediaStreamRef.current;

    try {
      const permissions = await Promise.all([
        navigator.permissions.query({ name: "camera" as PermissionName }),
        navigator.permissions.query({ name: "microphone" as PermissionName }),
      ]);

      if (permissions[0].state !== "granted" || permissions[1].state !== "granted") {
        addToast({
          title: "Quyền bị từ chối",
          description: "Vui lòng cấp quyền sử dụng webcam và micro.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
        return null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      mediaStreamRef.current = stream;
      setLocalStream(stream); // Update localStream state
      return stream;
    } catch (err) {
      console.error("Lỗi truy cập media: ", err);
      addToast({
        title: "Lỗi truy cập thiết bị",
        description: "Không thể lấy quyền truy cập webcam hoặc micro.",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
      return null;
    }
  };

  useEffect(() => {
    console.log("isAccept changed:", isAccept);
  }, [isAccept]);

  useEffect(() => {
    if (peer) {
      peer.on("call", handleIncomingCall);
    }

    return () => {
      peer?.off("call", handleIncomingCall);
    };
  }, [peer]);

  const handleIncomingCall = async (call: MediaConnection) => {
    const stream = await getMediaStream();
    if (!stream) return;

    call.answer(stream);

    call.on("stream", (remoteStream) => {
      setRemoteStream(remoteStream);
    });

    call.on("close", () => {
      setRemoteStream(null);
      setLocalStream(null);
      mediaStreamRef.current = null;
    });

    currentCall.current = call;
  };

  useEffect(() => {
    if (!socket || !peer || !peerId) return;

    const handleRoomUpdate = (res: any) => {
      console.log("room-update từ server:", res);
      setRoomId(res.roomId);
      if (res.status === "waiting") {
        console.log("Room status: waiting");
        setIsCalling(true);
        setIsAccept(false);
        setIsReject(false);
      } else if (res.status === "started") {
        console.log("Room status: started");
        setIsAccept(true);
        setIsCalling(false);
      } else if (res.status === "rejected") {
        console.log("Room status: rejected");
        setIsReject(true);
        setIsCalling(false);
        setLocalStream(null);
        setRemoteStream(null);
        mediaStreamRef.current = null;
      }
    };

    const handleReceivePeerId = async ({ peerId: remotePeerId }: { peerId: string }) => {
      console.log("Received peerId:", remotePeerId);
      const stream = await getMediaStream();
      if (!stream || !peer) return;

      const call = peer.call(remotePeerId, stream);
      currentCall.current = call;

      call.on("stream", (remoteStream) => {
        console.log("Received remoteStream:", remoteStream);
        setRemoteStream(remoteStream);
      });

      call.on("error", (err) => {
        console.error("Call error:", err);
        addToast({
          title: "Lỗi cuộc gọi",
          description: "Đã xảy ra lỗi trong quá trình kết nối.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
      });

      call.on("close", () => {
        console.log("Call closed");
        setLocalStream(null);
        setRemoteStream(null);
        setIsAccept(false);
        mediaStreamRef.current = null;
      });
    };

    socket.on("room-update", handleRoomUpdate);
    socket.on("receive-peer-id", handleReceivePeerId);

    return () => {
      socket?.off("room-update", handleRoomUpdate);
      socket?.off("receive-peer-id", handleReceivePeerId);
      peer?.off("call");

      // Cleanup media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setLocalStream(null);
      setRemoteStream(null);
    };
  }, [socket, peer, peerId]);

  const openVideoCall = async (callerId: string, calleeId: string) => {
    if (!peer || !peerId || !socket) return;

    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setIsCalling(true);
    setIsAccept(false);
    setIsReject(false);

    const stream = await getMediaStream();
    if (!stream) return;

    socket.emit("join-video-room", newRoomId, callerId, calleeId);
    console.log("Emitted join-video-room:", { roomId: newRoomId, callerId, calleeId });

    socket.emit("send-peer-id", { roomId: newRoomId, peerId, recipientId: calleeId });
    console.log("Emitted send-peer-id:", { roomId: newRoomId, peerId, recipientId: calleeId });
  };

  const handleAccept = async (clientId: string) => {
    if (!roomId || !socket || !peer || !peerId) return;

    const stream = await getMediaStream();
    if (!stream) return;

    socket.emit("join-video-room", roomId, clientId);
    console.log("Emitted join-video-room:", { roomId, clientId });

    socket.emit("send-peer-id", { roomId, peerId });
    console.log("Emitted send-peer-id:", { roomId, peerId });

    setIsAccept(true);
    setIsReject(false);
    setIsCalling(false);
  };

  const handleReject = () => {
    if (!roomId || !socket) return;

    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
    }

    socket.emit("reject-call", roomId);
    setIsReject(true);
    setIsAccept(false);
    setIsCalling(false);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const closeVideoCall = () => {
    if (!roomId || !socket) return;

    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
    }

    socket.emit("leave-video-room", roomId);
    setRoomId("");
    setIsAccept(false);
    setIsReject(false);
    setIsCalling(false);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const contextValue = useMemo(
    () => ({
      openVideoCall,
      handleAccept,
      handleReject,
      closeVideoCall,
      isAccept,
      isReject,
      isCalling,
      roomId,
      localStream,
      remoteStream,
    }),
    [isAccept, isReject, isCalling, roomId, localStream, remoteStream, socket, peer, peerId]
  );

  return (
    <VideoContextProvider.Provider value={contextValue}>
      {children}
    </VideoContextProvider.Provider>
  );
}

export const useVideoCall = () => {
  const context = useContext(VideoContextProvider);
  if (!context) {
    throw new Error("useVideoCall must be used within a VideoProvider");
  }
  return context;
};