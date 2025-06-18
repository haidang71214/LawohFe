"use client";

import React, { useEffect, useRef } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, addToast } from "@heroui/react";
import AgoraRTC, { IAgoraRTCRemoteUser } from "agora-rtc-sdk-ng";
import { axiosInstance } from "@/fetchApi";
import { useVideoCall } from "./videoCallContext";
import { USER_PROFILE } from "@/constant/enum";
import { useRouter } from "next/navigation";


export default function VideoCall() {
  const { isCallOpen, setIsCallOpen, clientId, lawyerId } = useVideoCall();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const client = useRef(AgoraRTC.createClient({ mode: "rtc", codec: "vp8" })).current;
 const router = useRouter();
  useEffect(() => {
    if (isCallOpen && clientId && lawyerId) {
      startCall();
    } else if (!isCallOpen) {
      leaveCall();
    }
  }, [isCallOpen, clientId, lawyerId]);

  const startCall = async () => {
    try {
       const shit = localStorage.getItem(USER_PROFILE);
      const response = await axiosInstance.get(`/video/TokenCallVideo/${clientId}/${lawyerId}`);
      const { data } = response.data;
      console.log(response);
      
      await client.join(data.appId, data.channelName, data.token, Number(clientId));
      const localStream = await AgoraRTC.createCameraVideoTrack();
      await client.publish(localStream);
      if (localVideoRef.current) {
        localStream.play(localVideoRef.current);
      }
      if(!shit){
         addToast({
            title: `Chưa đăng nhập`,
            description: `Bạn cần đăng nhập để tham gia gọi`,
            color: "danger",
            variant: "flat",
            timeout: 3000,
          }); 
          router.push('/login');
      }
      client.on("user-published", async (user: IAgoraRTCRemoteUser, mediaType: "audio" | "video" | "datachannel") => {
        console.log(`Người dùng ${user.uid} tham gia với mediaType: ${mediaType}`); // Sử dụng user.uid
        await client.subscribe(user, mediaType);
        if (mediaType === "video" && remoteVideoRef.current) {
          user.videoTrack?.play(remoteVideoRef.current);
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
        addToast({
          title: `Người dùng ${user.uid} đã tham gia`,
          description: `Loại media: ${mediaType}`,
          color: "success",
          variant: "flat",
          timeout: 3000,
        }); // Thông báo khi user tham gia
      });

      client.on("user-unpublished", (user: IAgoraRTCRemoteUser) => {
        console.log(`Người dùng ${user.uid} đã rời cuộc gọi`); // Sử dụng user.uid để tránh cảnh báo
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = null; // Đặt srcObject về null khi user rời
        }
        addToast({
          title: `Người dùng ${user.uid} đã rời`,
          description: "Cuộc gọi đã kết thúc với người dùng này",
          color: "warning",
          variant: "flat",
          timeout: 3000,
        }); // Thông báo khi user rời
      });
    } catch (error) {
      console.error("Lỗi khi khởi tạo cuộc gọi:", error);
      addToast({
        title: "Lỗi gọi video",
        description: "Vui lòng thử lại sau",
        color: "danger",
        variant: "flat",
        timeout: 4000,
      });
    }
  };

  const leaveCall = () => {
    client.leave();
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    setIsCallOpen(false); // Đóng modal khi rời cuộc gọi
  };

  return (
    <Modal
      isOpen={isCallOpen}
      onOpenChange={() => setIsCallOpen(false)}
      placement="top-center"
      style={{
        background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        borderRadius: "15px",
        boxShadow: "0 5px 20px rgba(0, 0, 0, 0.3)",
      }}
    >
      <ModalContent>
        <ModalHeader style={{ fontSize: "20px", color: "#1E3A8A", fontWeight: "700" }}>
          Cuộc gọi video
        </ModalHeader>
        <ModalBody style={{ textAlign: "center" }}>
          <video ref={localVideoRef} autoPlay muted style={{ width: "300px", margin: "10px" }} />
          <video ref={remoteVideoRef} autoPlay style={{ width: "300px", margin: "10px" }} />
        </ModalBody>
        <ModalFooter>
          <Button
            color="danger"
            variant="flat"
            onClick={leaveCall}
            style={{
              background: "linear-gradient(135deg, #EF4444, #DC2626)",
              color: "#F9FAFB",
              padding: "8px 20px",
              borderRadius: "20px",
            }}
          >
            Rời cuộc gọi
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}