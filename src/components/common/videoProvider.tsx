"use client";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { SocketContext } from "./socketProvider";
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
  // ⚡ Khởi tạo socket 1 lần
  useEffect(() => {
    if (!socket || !peer) return;

    // Nghe server gửi cập nhật room
    socket.on("room-update", (res: any) => {
      console.log("room-update từ server", res);
      setRoomId(res.roomId);
      if (res.status === "waiting") {
        setIsCalling(true);
        setIsAccept(false);
        setIsReject(false);
      } else if (res.status === "started") {
        setIsAccept(true);
        setIsCalling(false);
      } else if (res.status === "rejected") {
        setIsReject(true);
        setIsCalling(false);
        setLocalStream(null);
        setRemoteStream(null);
      }
    });
// kết nối với peer
    peer.on("call", async (call) => {
      console.log("Receiving call from:", call.peer);
      try {
        // Lấy stream từ webcam/micro
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);

        // Trả lời cuộc gọi và gửi stream của mình
        call.answer(stream);

        // Nhận stream từ peer gọi đến
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });

        call.on("close", () => {
          setLocalStream(null);
          setRemoteStream(null);
          setIsAccept(false);
        });
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    });


    return () => {
      socket.off("room-update");
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [socket, peer]);

  // 🎬 Gọi cuộc gọi
  const openVideoCall = async (callerId: string, calleeId: string) => {
    if (!peer || !peerId || !socket) return;

    const newRoomId = uuidv4();
    setRoomId(newRoomId);
    setIsCalling(true);
    setIsAccept(false);
    setIsReject(false);

    try {
      // Lấy stream từ webcam/micro
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);

      // Gửi yêu cầu tham gia room qua Socket.IO
      socket.emit("join-video-room", newRoomId, callerId, calleeId);

      // Lắng nghe thông báo từ server rằng callee đã tham gia
      socket.on("callee-joined", (calleePeerId: string) => {
        console.log("Callee joined with peer ID:", calleePeerId);
        // Bắt đầu gọi video đến callee
        const call = peer.call(calleePeerId, stream);
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
        });
        call.on("close", () => {
          setLocalStream(null);
          setRemoteStream(null);
          setIsAccept(false);
        });
      });
    } catch (err) {
      console.error("Error accessing media devices:", err);
    }
  };
  // ✅ Chấp nhận cuộc gọi
  const handleAccept = (clientId: string) => {
    if (!roomId || !socket) return;
    socket.emit("join-video-room", roomId, "callee", clientId);
    setIsAccept(true);
    setIsReject(false);
    setIsCalling(false);
  };  

  // ❌ Từ chối hoặc hủy cuộc gọi
  const handleReject = () => {
    if (!roomId || !socket) return;
    socket?.emit("reject-call", roomId);
    setIsReject(true);
    setIsAccept(false);
    setIsCalling(false);
    if(localStream){
    localStream.getTracks().forEach((track) => track.stop());
    setLocalStream(null)
    }
    setRemoteStream(null)
  };
  // ✅ Thêm hàm đóng video call
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
