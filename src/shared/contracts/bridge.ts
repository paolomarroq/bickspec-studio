export interface StudioBridge {
  app: {
    getVersion(): Promise<string>;
  };
}

declare global {
  interface Window {
    bickspecStudio?: StudioBridge;
  }
}

