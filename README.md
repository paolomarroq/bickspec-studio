# BickSpec Studio

BickSpec Studio is a lightweight desktop IDE for writing, compiling, reviewing, and exporting BickSpec financial specifications. This repository is the Electron desktop UI and launcher layer only.

The compiler lives in a separate repository so the UI can evolve independently from parser, compiler, runtime, and backend concerns. This project is prepared for future integration through typed service contracts and mock service implementations.

## Stack

- Electron for the desktop shell
- React for the renderer UI
- TypeScript across main, preload, renderer, and shared contracts
- Vite through `electron-vite`
- Spec Grid brand system: navy and teal palette, structured grids, technical-financial typography, and panel-based IDE layouts

## Approved UI Source

The approved visual source lives in `designs/`.

The React screens in this commit translate the approved HTML exports into reusable application structure. The HTML files are not the final runtime UI, but they remain the visual reference for layout, hierarchy, spacing, colors, light mode, and dark mode.

## Current Commit Scope

### Commit 2/3

This commit implements the approved BickSpec Studio desktop UI screens as real React/Electron screens while keeping the app UI-only.

- Translated the approved `designs/` HTML references into componentized React screens.
- Implemented the light/dark Spec Grid visual system across the launcher, workspace, settings, artifacts, and report preview flows.
- Added believable mock workflow state for selected projects, active files, editor tabs, compile state, terminal output, diagnostics, artifact selection, report export state, and settings values.
- Introduced reusable UI components for status badges, toolbar actions, launcher cards, file trees, code editor shells, terminal output, diagnostics, artifact navigation, and settings groups.
- Continued to use mock services behind typed interfaces so future compiler/backend integration can replace the mocks without restructuring the screens.

The current app is still a UI-only desktop IDE layer. Compile, run, artifact generation, report export, settings persistence, and project access are mocked.

### Commit 1/3

- Electron main process foundation
- Preload bridge foundation
- React renderer foundation
- Hash-based routing for Electron
- Five UI-only screen shells:
  - Welcome / Launcher
  - Main IDE Workspace
  - Settings
  - Generated Artifacts / Results
  - Report Preview & Export
- Light and dark theme architecture
- Shared service contracts for future backend/compiler integration
- Mock project, compiler, artifacts, report, and settings services
- Packaging-ready npm scripts and `electron-builder` metadata for future GitHub Actions workflows

## Run Locally

Install dependencies:

```bash
npm install
```

Start the desktop app:

```bash
npm run dev
```

Build the app:

```bash
npm run build
```

Package scripts are present for future installer work:

```bash
npm run package:dir
npm run package
```
