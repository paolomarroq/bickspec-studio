import { createContext, type ReactNode, useContext } from "react";
import type { StudioServices } from "@shared/contracts/services";
import { mockServices } from "./mockServices";

const ServicesContext = createContext<StudioServices>(mockServices);

export function ServiceProvider({ children, services = mockServices }: { children: ReactNode; services?: StudioServices }) {
  return <ServicesContext.Provider value={services}>{children}</ServicesContext.Provider>;
}

export function useServices() {
  return useContext(ServicesContext);
}
