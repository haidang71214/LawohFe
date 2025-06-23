// 'use client'
// import { useContext, useEffect, useState } from "react"
// import { io, Socket } from "socket.io-client"

// import { Button } from "@heroui/button";

// import { BASE_URL } from "@/fetchApi";
// import { SocketContext } from "@/components/common/socketProvider";

// interface userHaiProps {
//    id: string;
// }
// interface RoomUpdateResponse{
//    roomId:string;
//    status: "waiting" | "started" | "rejected";
//    clients:string[]
// }
// // không cần sửa ở đây, chô 
// // giao diện của thằng 2
// export default function UserHai({id}: Readonly<userHaiProps>){
// const [isCalled,setCalled] = useState<boolean>(false)
// const [socket,setSocket] = useState<Socket|undefined>()
// const [isCalling,setCalling] = useState(false)
// const dashboardSocket = useContext(SocketContext)
// const [roomId,setRoomId] = useState('')
// useEffect(()=>{
//    const _socket = io(BASE_URL, {
//       transports: ['websocket', 'polling']
//    });
//    console.log(_socket.connected)
//    setSocket(_socket);
// },[])
// // nhận được socket của thằng 1 gọi tới, theo emmit
// useEffect(()=>{
// if(dashboardSocket){
//    dashboardSocket.socket?.on('room-update',(res:RoomUpdateResponse)=>{
//       const client = res.clients[0]
//       console.log('hehe',res.roomId); // nó sẽ lấy cái id từ roomId truyền vô cái dưới 
//       // setRoomId(res.roomId)
//       setRoomId(res.roomId)
//       console.log(res);
      
//       if(client !== id){
//       // nếu cái status mà đang gọi ấy, thì setCalled là true, báo đang có người gọi tới
//          if(res.status === 'waiting'){
//                setCalling(true)
//                setCalled(false)
//          }else if(res.status === 'started'){
//             setCalled(true)
//             setCalling(true)
//          }
//          else {
//             setCalled(false)
//             setCalling(false)
//          }
//       }
//    })
// }},[id,dashboardSocket])
//       // mở cái room dasboard ra trước, ở đây, currentId 
//       const Accept = (clientId:string)=>{
//          socket?.emit("join-video-room",roomId,'1',clientId)
//          setCalled(true)
//       }  
//       const Reject = (roomId:string) => {
//          socket?.emit("reject-call",roomId)
//       }


//          return <div>
//       {isCalling && <>
//          Bạn nhận được cuộc gọi đó, giờ thì từ chối hay chấp nhận ?
//          <Button onPress={()=>Accept('2')}>Chấp nhận cuộc gọi</Button>
//          <Button onPress={()=>Reject(roomId)}>Hủy cuộc gọi</Button>
//       </>}
//       {isCalled && <>
//          Bắt đầu vào cuộc gọi 
//       </>}
//       <div>
//          Đang đợi người dùng gọi
//       </div>

//       </div>
// }