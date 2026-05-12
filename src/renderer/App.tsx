import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/shell/AppShell";
import { ArtifactsPage } from "./screens/ArtifactsPage";
import { ReportPreviewPage } from "./screens/ReportPreviewPage";
import { SettingsPage } from "./screens/SettingsPage";
import { WelcomePage } from "./screens/WelcomePage";
import { WorkspacePage } from "./screens/WorkspacePage";

export function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/workspace" element={<WorkspacePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/artifacts" element={<ArtifactsPage />} />
        <Route path="/report" element={<ReportPreviewPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

