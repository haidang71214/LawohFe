"use client";
import React, { createContext, useContext, useState, useMemo, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { SocketContext } from "./socketProvider";
import { addToast } from "@heroui/react";

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
  const latestPeerId = useRef<string | null>(null);
  useEffect(() => {
    console.log("isAccept changed:", isAccept);
  }, [isAccept]);
  useEffect(() => {
    if (peer && localStream && latestPeerId.current) {
      const call = peer.call(latestPeerId.current, localStream);
      call.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
      });
      call.on("error", (err) => {
        console.error("Call error:", err);
      });
    }
  }, [peer, localStream]);
  useEffect(() => {
    if (!socket|| !peer || !peerId) return;

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
        // ở trường hợp stated, chưa set local Stream
      } else if (res.status === "rejected") {
        console.log("Room status: rejected");
        setIsReject(true);
        setIsCalling(false);
        setLocalStream(null);
        setRemoteStream(null);
      }
    };

    // Lắng nghe peerId từ client khác
    const handleReceivePeerId = async ({ peerId }: { peerId: string }) => {
      console.log("Received peerId:", peerId);
      latestPeerId.current = peerId;
      // Nếu localStream chưa tồn tại, thiết lập nó
      if (!localStream) {
        try {
          const stream = await getMediaStream();
          setLocalStream(stream);
          console.log("Local stream set in handleReceivePeerId:", stream);
        } catch (error) {
          console.error("Error accessing media devices in handleReceivePeerId:", error);
          addToast({
            title: "Lỗi truy cập thiết bị",
            description: "Vui lòng cấp quyền sử dụng webcam và micro.",
            color: "danger",
            variant: "flat",
            timeout: 4000,
          });
          return; // Thoát nếu không thể thiết lập stream
        }
      }
    
      // Gọi peer.call chỉ khi localStream và peer tồn tại
      if (localStream && peer) {
        console.log("Calling peer.call with localStream:", localStream);
        const call = peer.call(peerId, localStream); // Sửa lỗi: chỉ truyền peerId và localStream
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
        });
      } else {
        console.error("No localStream or peer available");
        addToast({
          title: "Lỗi kết nối",
          description: "Không thể thiết lập cuộc gọi do thiếu stream hoặc peer.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
      }
    };
    socket.on("room-update", handleRoomUpdate);
    socket.on("receive-peer-id", handleReceivePeerId);
    const checkMediaPermissions = async () => {
      try {
        const cameraPermission = await navigator.permissions.query({ name: "camera" });
        const micPermission = await navigator.permissions.query({ name: "microphone" });
        if (cameraPermission.state !== "granted" || micPermission.state !== "granted") {
          addToast({
            title: "Quyền bị từ chối",
            description: "Vui lòng cấp quyền sử dụng webcam và micro.",
            color: "danger",
            variant: "flat",
            timeout: 4000,
          });
          return false;
        }
        return true;
      } catch (err) {
        console.error("Error checking permissions:", err);
        return false;
      }
    };
    
    const getMediaStream = async () => {
      const hasPermission = await checkMediaPermissions();
      if (!hasPermission) return null;
      console.log(hasPermission);
      
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        return stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        addToast({
          title: "Lỗi truy cập thiết bị",
          description: "Vui lòng cấp quyền sử dụng webcam và micro.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
        return null;
      }
    };
    peer.on("call", async (call) => {
      console.log("Incoming call from peer:", call.peer);
      try {
        const stream = await getMediaStream();
        if (!stream) return;
        setLocalStream(stream);
        console.log("Answering call with localStream:", stream);
        call.answer(stream);
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
        });
      } catch (err) {
        console.error("Error accessing media devices:", err);
        addToast({
          title: "Lỗi truy cập thiết bị",
          description: "Vui lòng cấp quyền sử dụng webcam và micro.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
      }
    });

    return () => {
      socket?.off("room-update", handleRoomUpdate);
      socket?.off("receive-peer-id", handleReceivePeerId);
    
      // cleanup peer event
      peer?.off("call");
    
      // cleanup local stream
      localStream?.getTracks().forEach(track => track.stop());
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [peer, peerId]);

  const openVideoCall = async (callerId: string, calleeId: string) => {
    if (!peer || !peerId || !socket) return;
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setIsCalling(true);
    setIsAccept(false);
    setIsReject(false);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      console.log("Local stream set:", stream);

      socket.emit("join-video-room", newRoomId, callerId, calleeId);
      console.log("Emitted join-video-room:", { roomId: newRoomId, callerId, calleeId });

      // Gửi peerId của caller
      socket.emit("send-peer-id", { roomId: newRoomId, peerId, recipientId: calleeId });
      console.log("Emitted send-peer-id:", { roomId: newRoomId, peerId, recipientId: calleeId });
    } catch (err) {
      console.error("Error accessing media devices:", err);
      addToast({
        title: "Lỗi truy cập thiết bị",
        description: "Vui lòng cấp quyền sử dụng webcam và micro.",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
    }
  };

  const handleAccept = async (clientId: string) => {
    if (!roomId || !socket || !peer || !peerId) return;

    try {
      if (!localStream) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        console.log("Local stream set in handleAccept:", stream);
      }

      socket.emit("join-video-room", roomId, clientId, "2");
      console.log("Emitted join-video-room:", { roomId, clientId, callerId: "2" });

      // Gửi peerId của callee
      socket.emit("send-peer-id", { roomId, peerId, recipientId: "2" });
      console.log("Emitted send-peer-id:", { roomId, peerId, recipientId: "2" });

      setIsAccept(true);
      setIsReject(false);
      setIsCalling(false);
    } catch (err) {
      console.error("Error in handleAccept:", err);
      addToast({
        title: "Lỗi khi chấp nhận cuộc gọi",
        description: "Không thể truy cập thiết bị hoặc thiết lập kết nối.",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
    }
  };

  const handleReject = () => {
    if (!roomId || !socket) return;
    socket.emit("reject-call", roomId);
    setIsReject(true);
    setIsAccept(false);
    setIsCalling(false);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
  };

  const closeVideoCall = () => {
    if (!roomId || !socket) return;
    socket.emit("leave-video-room", roomId);
    setRoomId("");
    setIsAccept(false);
    setIsReject(false);
    setIsCalling(false);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
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