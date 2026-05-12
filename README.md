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

