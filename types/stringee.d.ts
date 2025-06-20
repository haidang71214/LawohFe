declare module 'stringee' {
  export class StringeeClient {
    constructor();
    on(event: string, callback: (data: any) => void): void;
    connect(token: string): void;
  }

  export class StringeeCall2 {
    constructor(client: StringeeClient, from: string, to: string, video: boolean);
    on(event: string, callback: (data: any) => void): void;
    makeCall(callback: (response: any) => void): void;
    hangup(callback: (response: any) => void): void;
    subscribedTracks: any[];
  }
}