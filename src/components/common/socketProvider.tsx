"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { BASE_URL } from "@/fetchApi";
import { createContext } from "react";
import Peer  from "peerjs";
// { DataConnection, MediaConnection }
export const SocketContext = createContext<{
  socket: Socket | undefined;
  peer: Peer | undefined;
  peerId: string | undefined;
}>({
  socket: undefined,
  peer: undefined,
  peerId: undefined,
});

export default function SocketProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [socket, setSocket] = useState<Socket>();
  const [peer, setPeer] = useState<Peer>();
  const [peerId, setPeerId] = useState<string>();
  const [joined, setJoined] = useState<boolean>(false);

  useEffect(() => {
    // Khởi tạo Socket.IO
    const newSocket = io(BASE_URL, {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("SocketProvider connected:", newSocket.connected);
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("SocketProvider connection error:", error);
    });

    // Khởi tạo PeerJS
    const newPeer = new Peer({
      host: BASE_URL, // Hoặc server PeerJS của bạn
      port: 443,
    });

    // Lắng nghe sự kiện khi PeerJS mở và nhận Peer ID
    newPeer.on("open", (id) => {
      console.log("PeerJS opened with ID:", id);
      setPeer(newPeer);
      setPeerId(id);
      // Gửi Peer ID lên server Socket.IO để lưu trữ (nếu cần)
      newSocket.emit("register-peer-id", id);
    });

    newPeer.on("error", (err) => {
      console.error("PeerJS error:", err);
    });

    // Cleanup khi component unmount
    return () => {
      newSocket.disconnect();
      newPeer.destroy();
      console.log("SocketProvider and PeerJS disconnected");
    };
  }, []);

  // Join dashboard
  useEffect(() => {
    if (socket) {
      socket.on("dashboard-joined", () => {
        setJoined(true);
        console.log("Joined dashboard!");
      });

      socket.emit("join-dashboard");

      return () => {
        socket.off("dashboard-joined");
      };
    }
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, peer, peerId }}>
      {joined ? children : <p>Đang kết nối...</p>}
    </SocketContext.Provider>
  );
}