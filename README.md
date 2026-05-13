# BickSpec Studio

BickSpec Studio is a lightweight desktop IDE for writing, compiling, reviewing, and exporting financial specifications built with BickSpec.

BickSpec is the language. BickSpec Studio is the desktop application and IDE.

## Current Scope

This repository contains the polished desktop UI layer and the first backend foundation for linking to the external BickSpec language/compiler repository. Project loading, compile/run actions, Java generation, artifact output, report preview/export, and settings persistence still use local placeholder flows in the renderer while backend integration is built incrementally.

The compiler remains a separate project. BickSpec Studio must reference `bickspec-lang`; it must not duplicate compiler source or vendor the compiler implementation into this repository.

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

BickSpec Studio expects the language/compiler repository to live beside this project by default:

```text
workspace/
  bickspec-studio/
  bickspec-lang/
```

The default linked compiler repository path is:

```text
../bickspec-lang
```

If a project-local linked folder exists at `bickspec-studio/bickspec-lang`, Studio will use that linked repository path first. Otherwise, it falls back to the sibling layout above. The path is configurable through the backend settings file stored in Electron `userData`, and can also be seeded for development with:

```bash
BICKSPEC_LANG_REPOSITORY=/path/to/bickspec-lang
```

The compiler source is maintained externally at:

```text
https://github.com/paolomarroq/bickspec-lang
```

The backend validates that the linked repository looks like `bickspec-lang` by checking for signals such as:

- `app/pom.xml`
- `app/target/`
- `docs/BickSpec.g4`
- known compiler artifact names under `app/target/` when present

Current backend integration points are intentionally explicit:

- `src/shared/contracts/services.ts`
- `src/shared/contracts/domain.ts`
- `src/shared/contracts/backend.ts`
- `src/shared/contracts/bridge.ts`
- `src/main/backend/`
- `src/preload/index.ts`
- `src/renderer/services/ServiceProvider.tsx`
- `src/renderer/services/`

Commit 1/4 of backend integration adds:

- main-process backend services
- persistent backend settings
- linked compiler repository resolver
- Java and Maven availability checks
- typed preload IPC for backend status and linked compiler configuration
- workspace information for later compile/run flows

Commit 2/4 adds real compiler execution from the linked repository:

- resolves an existing compiler jar from `app/target/`, including `bickspec-compiler-1.0.0.jar` and matching `bickspec-*.jar` artifacts
- reports when the jar is missing but `app/pom.xml` indicates the linked repository is buildable
- runs the compiler in the Electron main process with `java -jar <artifact> <file-or-directory>`
- captures stdout, stderr, exit code, command, working directory, duration, linked repo path, artifact path, and interactive-timeout metadata
- parses tagged compiler output such as `[ERROR]`, `[SYMBOLS]`, `[TREE]`, `[JAVA]`, `[BUILD]`, `[EXECUTION]`, and `[SUCCESS]`
- exposes typed preload APIs for file/directory execution, artifact resolution, execution status, last result, and output parsing

Later backend commits should use this foundation to compile the current file, run BickSpec on a project/folder, retrieve generated artifacts, surface diagnostics/results, and power report/export flows.

## Project Structure

```text
src/
  main/                 Electron main process and window creation
    backend/            linked compiler resolver, settings, status, and process services
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
