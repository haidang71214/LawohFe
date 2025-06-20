declare module 'stringee' {
  export class StringeeClient {
    constructor();
    on(event: string, callback: (data: any) => void): void;
    connect(token: string): void;
    disconnect(): void; // Thêm phương thức disconnect
  }

  export class StringeeCall2 {
    constructor(client: StringeeClient, from: string, to: string, video: boolean);
    on(event: string, callback: (data: any) => void): void;
    makeCall(callback: (response: any) => void): void;
    hangup(callback: (response: any) => void): void;
    subscribedTracks: any[];
  }

  export class StringeeRoom {
    constructor(client: StringeeClient, roomId: string, token: string);
    on(event: string, callback: (data: any) => void): void;
    off(event: string, callback?: (data: any) => void): void; // Thêm phương thức off
    publish(track: any): Promise<void>; // Thêm phương thức publish
    // Thêm các phương thức khác nếu cần, ví dụ join, leave, subscribe, v.v.
  }
}
declare global {
  interface Window {
    StringeeClient: typeof StringeeClient;
    StringeeVideo: {
      createLocalVideoTrack: (
        client: StringeeClient,
        options: {
          audio?: boolean;
          video?: boolean;
          screen?: boolean;
          videoDimensions?: { width: number; height: number };
        }
      ) => Promise<any>; // Thay 'any' bằng type cụ thể nếu biết
    };
  }
}