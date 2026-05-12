# BickSpec Studio

BickSpec Studio is a lightweight desktop IDE for writing, compiling, reviewing, and exporting financial specifications built with BickSpec.

BickSpec is the language. BickSpec Studio is the desktop application and IDE.

## Current Scope

This repository contains the final polished desktop UI layer before backend compiler integration. Project loading, compile/run actions, Java generation, artifact output, report preview/export, and settings persistence use local placeholder services so the product can be reviewed and demonstrated without coupling the renderer to backend implementation details.

The compiler remains a separate project. Future integration should connect through the existing service contracts and Electron preload/main boundaries.

## Approved Brand Direction

The approved brand is BickSpec Option 03: Spec Grid.

The UI preserves the approved direction:

- structure, specification, brackets, grid, and financial clarity
- navy and teal palette
- Sora for interface typography
- IBM Plex Mono for code, console, and technical output
- desktop-first panel composition
- approved Spec Grid logo/icon assets only

The visual source of truth lives in:

- `designs/`
- `designs/brand/`

## Implemented UI

- Welcome / Launcher
- Main IDE Workspace
- Settings
- Generated Artifacts / Results
- Report Preview & Export

The app includes a polished app shell, approved brand assets, light/dark/system theme selection, recent project states, editor tabs, diagnostics, terminal output, generated artifacts, report preview, export actions, and local status feedback.

## Future Backend Integration

Integration points are intentionally explicit:

- `src/shared/contracts/services.ts`
- `src/shared/contracts/domain.ts`
- `src/renderer/services/ServiceProvider.tsx`
- `src/renderer/services/`

The future compiler adapter should replace the current local service implementation while preserving the renderer/main/preload separation.

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
    services/           local service provider and placeholder implementation
    styles/             global Spec Grid CSS and theme variables
    theme/              light/dark/system theme provider
buildResources/         app icon resources for Electron Builder
.github/workflows/      CI build and packaging scaffold
designs/                approved HTML and brand references
```

## Run Locally

```bash
npm install
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

The GitHub Actions workflow installs dependencies, builds the app, runs a Windows directory package, and uploads packaged artifacts from `release/`. Signing, notarization, release publishing, and platform-specific installer hardening can be added when distribution requirements are finalized.
