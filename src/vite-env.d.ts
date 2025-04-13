/// <reference types="vite/client" />

declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
  }

  export interface GIFFrameOptions {
    delay?: number;
    copy?: boolean;
  }

  export default class GIF {
    constructor(options?: GIFOptions);
    addFrame(image: HTMLImageElement, options?: GIFFrameOptions): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
  }
}