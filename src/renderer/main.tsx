import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { App } from "./App";
import { ServiceProvider } from "./services/ServiceProvider";
import { StudioSessionProvider } from "./state/StudioSessionProvider";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./styles/global.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <ServiceProvider>
        <HashRouter>
          <StudioSessionProvider>
            <App />
          </StudioSessionProvider>
        </HashRouter>
      </ServiceProvider>
    </ThemeProvider>
  </React.StrictMode>
);
