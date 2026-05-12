import { contextBridge, ipcRenderer } from "electron";
import type { StudioBridge } from "@shared/contracts/bridge";

const bridge: StudioBridge = {
  app: {
    getVersion: () => ipcRenderer.invoke("app:get-version") as Promise<string>
  }
};

contextBridge.exposeInMainWorld("bickspecStudio", bridge);

