"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, ModalContent, addToast } from "@heroui/react";
import { SocketContext } from "@/components/common/socketProvider";
import { useVideoCall } from "@/components/common/videoProvider";
import { PhoneOff, Video, X, Check } from "lucide-react";
import { USER_PROFILE } from "@/constant/enum";
// import { USER_PROFILE } from "@/constant/enum";
// giờ úm ba la ra provider để nó hiện modal mỗi khi click thôi

interface RoomUpdateResponse {
  roomId: string;
  status: "waiting" | "started" | "rejected";
  clients: string[];
}

export default function UserHai() {
  const { socket } = useContext(SocketContext);
  const { handleAccept, handleReject, isCalling, isAccept, localStream, remoteStream, closeVideoCall } = useVideoCall();
  const [isCallModalOpen, setIsCallModalOpen] = useState<boolean>(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [callerId, setCallerId] = useState<string>("");
  // handle accept có set cái isAccept không ?
  // Lấy clientId từ localStorage
  const getClientId = () => {
    const userProfileStr = localStorage.getItem(USER_PROFILE) || "";
    try {
      const userProfile = JSON.parse(userProfileStr) as { _id?: string };
      return userProfile._id || "";
    } catch {
      return "";
    }
  };    

  // Gán stream video
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('aaaaaaaaaaaaaaaaaaa',remoteVideoRef);
      
    }
    //remote stream đang bị null
    console.log('aaaaaaaabbbbbbbbbbba',remoteStream);
      
  }, [localStream, remoteStream]);


useEffect(() => {
  // ở đây nó cũng log ra true rồi, tại sao ở dưới
  console.log("isAccept from useVideoCall:", isAccept);
}, [isAccept]);

  // Xử lý sự kiện room-update cho callee
  useEffect(() => {
    if (!socket) return;
    console.log(isAccept);
      
    // const clientId = getClientId();
    socket.on("room-update", (res: RoomUpdateResponse) => {
      console.log("Received room-update in UserHai:", res);
      
      // Chỉ xử lý nếu client là callee (clientId là người nhận cuộc gọi)
      if (res.clients[1] === '68512260d40e59a325660b1c' && res.status === "waiting") {
        setCallerId(res.clients[0]); // Lưu callerId
        setIsCallModalOpen(true); // Mở modal cho cuộc gọi đến
        addToast({
          title: "Cuộc gọi đến",
          description: `Đang nhận cuộc gọi từ ${res.clients[0]}`,
          color: "foreground",
          variant: "flat",
          timeout: 4000,
        });
      } else if (res.status === "started") {
        setIsCallModalOpen(true); // Giữ modal mở khi cuộc gọi bắt đầu
        addToast({
          title: "Cuộc gọi đã bắt đầu!",
          description: "Kết nối thành công.",
          color: "success",
          variant: "flat",
          timeout: 4000,
        });
      } else if (res.status === "rejected") {
        setIsCallModalOpen(false); // Đóng modal khi cuộc gọi bị từ chối
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
    console.log("Calling handleAccept with clientId:", clientId);
    handleAccept(clientId);
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
    <div
      style={{
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
        padding: "40px",
      }}
    >
      <h1
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#1E3A8A",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        UserHai - Nhận cuộc gọi video
      </h1>

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
                  letterSpacing: "0.5px",
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
                  background: "transparent",
                  transition: "background 0.2s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#e5e7eb")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div
                  style={{
                    position: "relative",
                    background: "#000",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)",
                    height: "300px",
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
                        color: "#ffffff",
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
                </div>
                {isAccept && (
                  <div
                    style={{
                      position: "absolute",
                      top: "32px",
                      right: "32px",
                      width: "160px",
                      height: "120px",
                      background: "#000",
                      borderRadius: "8px",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
                      border: "2px solid #ffffff",
                      zIndex: 10,
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
                <div
                  style={{
                    textAlign: "center",
                    padding: "12px 0",
                    fontSize: "16px",
                    fontWeight: "500",
                    color: isCalling ? "#f59e0b" : isAccept ? "#16a34a" : "#6b7280",
                    transition: "color 0.3s ease",
                  }}
                >
                  {isCalling ? "Đang gọi..." : isAccept ? "Đã kết nối..." : "Cuộc gọi đã kết thúc."}
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
                      color: "#f9fafb",
                      padding: "10px 24px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      transition: "transform 0.2s ease, background 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
                      color: "#f9fafb",
                      padding: "10px 24px",
                      borderRadius: "20px",
                      fontWeight: "600",
                      transition: "transform 0.2s ease, background 0.3s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
                    color: "#f9fafb",
                    padding: "10px 24px",
                    borderRadius: "20px",
                    fontWeight: "600",
                    transition: "transform 0.2s ease, background 0.3s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
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