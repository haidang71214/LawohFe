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

  const getMediaStream = async (): Promise<MediaStream | null> => {
    if (mediaStreamRef.current) {
      console.log("Tái sử dụng stream hiện tại, tracks:", mediaStreamRef.current.getTracks());
      return mediaStreamRef.current;
    }

    try {
      const permissions = await Promise.all([
        navigator.permissions.query({ name: "camera" as PermissionName }),
        navigator.permissions.query({ name: "microphone" as PermissionName }),
      ]);

      if (permissions[0].state !== "granted" || permissions[1].state !== "granted") {
        addToast({
          title: "Quyền bị từ chối",
          description: "Vui lòng cấp quyền webcam và micro trong trình duyệt.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
        return null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      console.log("Tạo stream mới, tracks:", stream.getTracks());
      mediaStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Lỗi lấy media:", err);
      addToast({
        title: "Lỗi truy cập thiết bị",
        description: "Không thể lấy webcam hoặc micro. Kiểm tra quyền hoặc thiết bị.",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
      return null;
    }
  };

  useEffect(() => {
    if (peer) {
      peer.on("call", handleIncomingCall);
      console.log("Đăng ký listener cho peer.on('call')");
    }

    return () => {
      peer?.off("call", handleIncomingCall);
      console.log("Gỡ listener peer.on('call')");
    };
  }, [peer]);

  const handleIncomingCall = async (call: MediaConnection) => {
    console.log("Nhận cuộc gọi từ peer:", call.peer);
    const stream = await getMediaStream();
    if (!stream) {
      console.error("Không có local stream để trả lời cuộc gọi");
      return;
    }

    call.answer(stream);
    console.log("Trả lời cuộc gọi với stream, tracks:", stream.getTracks());
    currentCall.current = call;

    call.on("stream", (remoteStream) => {
      console.log("Nhận remote stream, tracks:", remoteStream.getTracks());
      if (remoteStream.getAudioTracks().length === 0) {
        console.error("Remote stream không có track audio");
      }
      setRemoteStream(remoteStream);
    });

    call.on("error", (err) => {
      console.error("Lỗi cuộc gọi:", err);
      addToast({
        title: "Lỗi cuộc gọi",
        description: "Có lỗi khi kết nối. Vui lòng thử lại.",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
    });

    call.on("close", () => {
      console.log("Cuộc gọi đóng");
      setRemoteStream(null);
      setLocalStream(null);
      mediaStreamRef.current = null;
      setIsAccept(false);
    });
  };

  useEffect(() => {
    if (!socket || !peer || !peerId) {
      console.log("Thiếu socket, peer hoặc peerId");
      return;
    }

    const handleRoomUpdate = (res: any) => {
      console.log("Nhận room-update từ server:", res);
      setRoomId(res.roomId);
      if (res.status === "waiting") {
        console.log("Trạng thái phòng: waiting");
        setIsCalling(true);
        setIsAccept(false);
        setIsReject(false);
      } else if (res.status === "started") {
        console.log("Trạng thái phòng: started");
        setIsAccept(true);
        setIsCalling(false);
      } else if (res.status === "rejected") {
        console.log("Trạng thái phòng: rejected");
        setIsReject(true);
        setIsCalling(false);
        setLocalStream(null);
        setRemoteStream(null);
        mediaStreamRef.current = null;
      }
    };

    const handleReceivePeerId = async ({ peerId: remotePeerId }: { peerId: string }) => {
      console.log("Nhận peerId từ đối phương:", remotePeerId);
      const stream = await getMediaStream();
      if (!stream || !peer) {
        console.error("Không có stream hoặc peer để gọi");
        return;
      }

      console.log("Gọi peer với stream, tracks:", stream.getTracks());
      const call = peer.call(remotePeerId, stream);
      currentCall.current = call;

      call.on("stream", (remoteStream) => {
        console.log("Nhận remote stream, tracks:", remoteStream.getTracks());
        if (remoteStream.getAudioTracks().length === 0) {
          console.error("Remote stream không có track audio");
        }
        setRemoteStream(remoteStream);
      });

      call.on("error", (err) => {
        console.error("Lỗi cuộc gọi:", err);
        addToast({
          title: "Lỗi cuộc gọi",
          description: "Có lỗi khi kết nối. Vui lòng thử lại.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
      });

      call.on("close", () => {
        console.log("Cuộc gọi đóng");
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

      if (mediaStreamRef.current) {
        console.log("Dọn dẹp stream, tracks:", mediaStreamRef.current.getTracks());
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setLocalStream(null);
      setRemoteStream(null);
      console.log("Dọn dẹp useEffect chính");
    };
  }, [socket, peer, peerId]);

  const openVideoCall = async (callerId: string, calleeId: string) => {
    if (!peer || !peerId || !socket) {
      console.error("Thiếu peer, peerId hoặc socket");
      return;
    }

    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setIsCalling(true);
    setIsAccept(false);
    setIsReject(false);

    const stream = await getMediaStream();
    if (!stream) {
      console.error("Không lấy được stream để gọi");
      return;
    }

    socket.emit("join-video-room", newRoomId, callerId, calleeId);
    console.log("Gửi join-video-room:", { roomId: newRoomId, callerId, calleeId });

    socket.emit("send-peer-id", { roomId: newRoomId, peerId, recipientId: calleeId });
    console.log("Gửi send-peer-id:", { roomId: newRoomId, peerId, recipientId: calleeId });
  };

  const handleAccept = async (clientId: string) => {
    if (!roomId || !socket || !peer || !peerId) {
      console.error("Thiếu roomId, socket, peer hoặc peerId");
      return;
    }

    const stream = await getMediaStream();
    if (!stream) {
      console.error("Không lấy được stream để chấp nhận cuộc gọi");
      return;
    }

    socket.emit("join-video-room", roomId, clientId);
    console.log("Gửi join-video-room:", { roomId, clientId });

    socket.emit("send-peer-id", { roomId, peerId });
    console.log("Gửi send-peer-id:", { roomId, peerId });

    setIsAccept(true);
    setIsReject(false);
    setIsCalling(false);
  };

  const handleReject = () => {
    if (!roomId || !socket) return;

    if (currentCall.current) {
      currentCall.current.close();
      currentCall.current = null;
      console.log("Đóng MediaConnection");
    }

    socket.emit("reject-call", roomId);
    setIsReject(true);
    setIsAccept(false);
    setIsCalling(false);

    if (mediaStreamRef.current) {
      console.log("Dọn dẹp stream khi từ chối, tracks:", mediaStreamRef.current.getTracks());
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
      console.log("Đóng MediaConnection");
    }

    socket.emit("leave-video-room", roomId);
    setRoomId("");
    setIsAccept(false);
    setIsReject(false);
    setIsCalling(false);

    if (mediaStreamRef.current) {
      console.log("Dọn dẹp stream khi đóng cuộc gọi, tracks:", mediaStreamRef.current.getTracks());
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
    throw new Error("useVideoCall phải được dùng trong VideoProvider");
  }
  return context;
};