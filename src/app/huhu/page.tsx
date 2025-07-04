"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalContent,
  addToast,
} from "@heroui/react";
import { SocketContext } from "@/components/common/socketProvider";
import { useVideoCall } from "@/components/common/videoProvider";
import { PhoneOff, Video, X, Check } from "lucide-react";
import { USER_PROFILE } from "@/constant/enum";

interface RoomUpdateResponse {
  roomId: string;
  status: "waiting" | "started" | "rejected";
  clients: string[];
}

export default function UserHai() {
  const { socket } = useContext(SocketContext);
  const {
    handleAccept,
    handleReject,
    isCalling,
    isAccept,
    localStream,
    remoteStream,
    closeVideoCall,
  } = useVideoCall();

  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [callerId, setCallerId] = useState("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const getClientId = () => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || "";
    try {
      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      return userProfile._id || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  useEffect(() => {
    if (!socket) return;
    const clientId = getClientId();

    socket.on("room-update", (res: RoomUpdateResponse) => {
      console.log("Received room-update:", res);
      if (res.clients[1] === clientId && res.status === "waiting") {
        setCallerId(res.clients[0]);
        setIsCallModalOpen(true);
        addToast({
          title: "Cuộc gọi đến",
          description: `Đang nhận cuộc gọi từ ${res.clients[0]}`,
          color: "foreground",
          variant: "flat",
          timeout: 4000,
        });
      } else if (res.status === "started") {
        setIsCallModalOpen(true);
        addToast({
          title: "Cuộc gọi đã bắt đầu",
          description: "Kết nối thành công.",
          color: "success",
          variant: "flat",
          timeout: 4000,
        });
      } else if (res.status === "rejected") {
        setIsCallModalOpen(false);
        addToast({
          title: "Cuộc gọi bị từ chối",
          description: "Cuộc gọi đã bị hủy.",
          color: "danger",
          variant: "flat",
          timeout: 4000,
        });
      }
    });

    return () => {
      socket.off("room-update");
    };
  }, [socket]);

  const handleCallAccept = () => {
    const clientId = getClientId();
    if (!clientId) {
      addToast({
        title: "Lỗi",
        description: "Vui lòng đăng nhập để chấp nhận cuộc gọi.",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
      return;
    }
    handleAccept(clientId); // isAccept sẽ được set ở useVideoCall
  };

  const handleCallReject = () => {
    handleReject();
    setIsCallModalOpen(false);
    addToast({
      title: "Đã từ chối cuộc gọi",
      description: "Cuộc gọi đã được hủy.",
      color: "warning",
      variant: "flat",
      timeout: 4000,
    });
  };

  const cancelCall = () => {
    handleReject();
    setIsCallModalOpen(false);
    addToast({
      title: "Đã hủy cuộc gọi",
      description: "Cuộc gọi đã được hủy thành công.",
      color: "warning",
      variant: "flat",
      timeout: 4000,
    });
  };

  return (
    <div>
      {isCallModalOpen && (
        <Modal
          style={{
            background: "linear-gradient(135deg, #f5f7fa, #e2e8f0)",
            borderRadius: "20px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
            overflow: "hidden",
            maxWidth: "800px",
            width: "90%",
            animation: "fadeIn 0.3s ease-in-out",
          }}
          isOpen={isCallModalOpen}
          onOpenChange={() => {
            closeVideoCall();
            setIsCallModalOpen(false);
          }}
          placement="center"
        >
          <ModalContent>
            <ModalHeader
              style={{
                padding: "16px 24px",
                background: "linear-gradient(135deg, #ffffff, #f1f5f9)",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1e3a8a",
                }}
              >
                {isAccept ? "Cuộc gọi video" : "Cuộc gọi đến"}
              </span>
              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  closeVideoCall();
                  setIsCallModalOpen(false);
                }}
                style={{
                  padding: "8px",
                  borderRadius: "50%",
                }}
              >
                <X size={20} color="#6b7280" />
              </Button>
            </ModalHeader>
            <ModalBody
              style={{
                padding: "24px",
                background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
              }}
            >
              <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    background: "#000",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                    height: "300px",
                    position: "relative",
                  }}
                >
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                  {!isAccept && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, #1e3a8a, #3b82f6)",
                        color: "#fff",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "64px",
                          height: "64px",
                          background: "#ffffff33",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Video size={32} color="#ffffff" />
                      </div>
                      <span style={{ fontSize: "16px", fontWeight: "500" }}>
                        Cuộc gọi từ {callerId}
                      </span>
                    </div>
                  )}
                  {isAccept && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "16px",
                        right: "16px",
                        width: "160px",
                        height: "120px",
                        background: "#000",
                        borderRadius: "8px",
                        overflow: "hidden",
                        border: "2px solid #ffffff",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                      }}
                    >
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>

                <div
                  style={{
                    textAlign: "center",
                    padding: "12px 0",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: isCalling
                      ? "#f59e0b"
                      : isAccept
                      ? "#16a34a"
                      : "#6b7280",
                  }}
                >
                  {isCalling
                    ? "Đang gọi..."
                    : isAccept
                    ? "Đã kết nối..."
                    : "Cuộc gọi đã kết thúc."}
                </div>
              </div>
            </ModalBody>
            <ModalFooter
              style={{
                padding: "16px 24px",
                background: "#ffffff",
                borderTop: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "center",
                gap: "16px",
              }}
            >
              {!isAccept && (
                <>
                  <Button
                    color="success"
                    variant="flat"
                    onClick={handleCallAccept}
                    style={{
                      background: "linear-gradient(135deg, #16a34a, #15803d)",
                      color: "#fff",
                      padding: "10px 24px",
                      borderRadius: "20px",
                      fontWeight: "600",
                    }}
                  >
                    <Check size={20} style={{ marginRight: "8px" }} />
                    Chấp nhận
                  </Button>
                  <Button
                    color="danger"
                    variant="flat"
                    onClick={handleCallReject}
                    style={{
                      background: "linear-gradient(135deg, #ef4444, #dc2626)",
                      color: "#fff",
                      padding: "10px 24px",
                      borderRadius: "20px",
                      fontWeight: "600",
                    }}
                  >
                    <PhoneOff size={20} style={{ marginRight: "8px" }} />
                    Từ chối
                  </Button>
                </>
              )}
              {isAccept && (
                <Button
                  color="danger"
                  variant="flat"
                  onClick={cancelCall}
                  style={{
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#fff",
                    padding: "10px 24px",
                    borderRadius: "20px",
                    fontWeight: "600",
                  }}
                >
                  <PhoneOff size={20} style={{ marginRight: "8px" }} />
                  Hủy cuộc gọi
                </Button>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
