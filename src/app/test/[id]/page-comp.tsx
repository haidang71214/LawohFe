"use client";

import { useContext, useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { SocketContext } from "@/components/common/socketProvider";

interface PageCompProps {
   id: string;
}

export interface RoomUpdateResponse {
   roomId: string;
   status: "waiting" | "started" | "rejected";
   clients: string[];
}

export default function PageComp({ id }: Readonly<PageCompProps>) {
   const roomId = "cbee894b-498e-40cb-aa92-2c56829c4969";
   const [calling, setCalling] = useState<boolean>(false);
   const dashboardSocket = useContext(SocketContext);

   // Lắng nghe sự kiện room-update
   useEffect(() => {
      if (dashboardSocket) {
         dashboardSocket.socket?.on("room-update", (res: RoomUpdateResponse) => {
            console.log("Received room-update:", res);
            const client = res.clients[0];

            if (client === id) {
               if (res.status === "waiting") {
                  setCalling(true);
               } else {
                  setCalling(false);
               }
            } else if (res.status === "rejected") {
               setCalling(false);
            }
         });

         return () => {
            dashboardSocket.socket?.off("room-update");
         };
      }
   }, [dashboardSocket, id]);

   // Gọi người dùng
   const call = (currentId: string) => () => {
      if (dashboardSocket) {
         dashboardSocket.socket?.emit("join-video-room", roomId, id, currentId);
      } else {
         console.error("Socket not initialized");
      }
   };

   // Hủy cuộc gọi
   const cancelCall = () => {
      if (dashboardSocket) {
         dashboardSocket.socket?.emit("reject-call", roomId);
         setCalling(false);
      } else {
         console.error("Socket not initialized");
      }
   };

   return (
      <div>
         <Button onPress={call("2")}>Gọi cho 2</Button>
         {calling && (
            <>
               <p>Đang gọi...</p>
               <Button onPress={cancelCall}>Hủy cuộc gọi</Button>
            </>
         )}
      </div>
   );
}