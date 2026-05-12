# BickSpec Studio

BickSpec Studio is a lightweight desktop IDE for writing, compiling, reviewing, and exporting BickSpec financial specifications.

This repository is the desktop UI and launcher layer. It is intentionally separate from the compiler repository so the Electron shell, renderer experience, packaging, and brand system can mature independently from parser/compiler/runtime work.

## Current Scope

The app is UI-only today. Project loading, compile/run actions, Java generation, artifact output, report preview/export, and settings persistence are represented with mock services and realistic placeholder state.

The implementation is structured so future backend and compiler integration can attach through typed service contracts instead of being hardwired into React screens.

## Approved Visual Source

The approved UI source of truth lives in:

- `designs/`
- `designs/brand/`

The screen layouts, hierarchy, spacing, typography, navy/teal Spec Grid tone, and light/dark direction were translated from the approved HTML design exports. The top-left app chrome icon, launcher wordmark, and Electron app icon use approved PNG assets copied from `designs/brand/`.

## What Is Implemented

- Electron main process, preload bridge, and React renderer separation
- React Router routes for:
  - Welcome / Launcher
  - Main IDE Workspace
  - Settings
  - Generated Artifacts / Results
  - Report Preview & Export
- Spec Grid light and dark theme tokens
- Approved brand logo/icon usage in app chrome, launcher, and Electron window icon
- Componentized desktop UI:
  - app shell and top toolbar
  - launcher action cards
  - recent project rows
  - file tree
  - editor shell
  - terminal output
  - diagnostics list
  - artifact navigator
  - settings groups
  - status badges and toolbar buttons
- Mock product workflow states:
  - selected project/file
  - active editor tab
  - compile/run feedback
  - generated artifact selection
  - report preview/export feedback
  - settings values

## Future Backend Integration

The future compiler/backend integration points are in:

- `src/shared/contracts/services.ts`
- `src/shared/contracts/domain.ts`
- `src/renderer/services/ServiceProvider.tsx`
- `src/renderer/services/mockServices.ts`

The current mock services implement explicit contracts for projects, compiler actions, artifacts, reports, and settings. Real integration should replace the service implementation behind `ServiceProvider` and use the preload/main boundary for privileged desktop operations.

## Project Structure

```text
src/
  main/                 Electron main process and window creation
  preload/              secure renderer bridge
  shared/contracts/     domain and service contracts
  assets/brand/         approved runtime brand assets copied from designs/brand
  renderer/
    components/         reusable UI components
    screens/            route-level screens
    services/           mock services and service provider
    styles/             global Spec Grid CSS and theme variables
    theme/              light/dark theme provider
buildResources/         app icon resources for Electron Builder
.github/workflows/      CI build and packaging scaffold
designs/                approved HTML and brand references
```

## Run Locally

Install dependencies:

```bash
npm install
```

Start the desktop app:

```bash
npm run dev
```

Typecheck and build:

```bash
npm run build
```

## Packaging

Packaging is scaffolded with Electron Builder:

```bash
npm run package:dir
npm run package
npm run package:win
npm run package:mac
npm run package:linux
```

The initial GitHub Actions workflow installs dependencies, builds the app, runs a directory package, and uploads packaged artifacts from `release/`. Signing, notarization, release publishing, and platform-specific icon format hardening can be added when distribution requirements are finalized.

