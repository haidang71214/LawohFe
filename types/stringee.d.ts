interface StringeeClient {
   new (): any;
   connect(token: string): void;
   on(event: string, callback: (res: any) => void): void;
   disconnect(): void;
 }
 
 interface StringeeVideo {
   createLocalVideoTrack(client: any, options: {
     audio?: boolean;
     video?: boolean;
     screen?: boolean;
     videoDimensions?: { width: number; height: number } | { width: { min: string; max: string }; height: { min: string; max: string } };
   }): Promise<any>;
   joinRoom(client: any, roomToken: string): Promise<any>;
 }
 
 interface Window {
   StringeeClient: StringeeClient;
   StringeeVideo: StringeeVideo;
 }    