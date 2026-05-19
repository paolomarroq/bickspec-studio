# BickSpec Studio — factual documentation source

## 1. Product overview

- **BickSpec Studio** is a desktop IDE for writing, compiling, reviewing, and exporting BickSpec financial specifications.
- **BickSpec** is the language; **BickSpec Studio** is the desktop application around it.
- Studio is implemented as a separate project from the compiler. Studio packages the built compiler JAR, but does not duplicate or vendor compiler source code.
- The normal compiler model expects the bundled JAR in Studio resources. A local `bickspec-lang` checkout remains optional for developers who want to test linked compiler builds.
- The default configured compiler repository URL is `https://github.com/paolomarroq/bickspec-lang`.

## 2. Architecture

- Stack: **Electron + React + TypeScript + Vite**.
- `package.json` identifies the app as an Electron desktop product built with `electron-vite`; the renderer depends on React, React Router, Monaco Editor, Lucide icons, and `xlsx`.
- **Electron main process** responsibilities include:
  - creating the application window;
  - instantiating backend services;
  - resolving linked compiler repositories and artifacts;
  - running Java/compiler processes;
  - managing interactive child processes;
  - reading/writing files and workspace state;
  - discovering artifacts;
  - exporting reports;
  - handling setup-wizard actions;
  - registering IPC handlers.
- **Preload bridge** responsibilities:
  - exposes a typed `window.bickspecStudio` API through `contextBridge`;
  - forwards renderer requests to IPC for compiler execution, workspace actions, artifact access, interactive input, report export, and setup-wizard operations;
  - exposes clipboard read/write helpers.
- **Renderer** responsibilities:
  - renders the app shell, routes, workspace, artifacts page, report preview, settings, and setup wizard;
  - manages visible editor/session state;
  - uses backend APIs rather than direct Node access.
- IPC flow is explicit:
  - renderer calls `window.bickspecStudio.backend.*`;
  - preload maps those calls to `ipcRenderer.invoke(...)`;
  - main registers matching `ipcMain.handle(...)` handlers;
  - backend services perform filesystem/process work and return typed data.

## 3. Main screens

- **Welcome / Launcher**
  - landing screen with actions for new file, opening a `.bks` file, and opening a project folder;
  - shows recent files/folders from persisted workspace state.
- **Main IDE Workspace**
  - explorer, editor area, context inspector, outline, and bottom session-output panel;
  - file tabs and compile/run controls are present.
- **Settings**
  - searchable settings page;
  - includes appearance, compiler/setup information, and setup-wizard actions.
- **Generated Artifacts / Results**
  - route `/artifacts`;
  - shows discovered artifacts, artifact preview, build log, diagnostics, output-folder access, export, re-run, and back-to-editor actions.
- **Report Preview & Export**
  - route `/report`;
  - shows a real report derived from the latest compiler session, with export actions.
- **Setup Wizard**
  - implemented as a first-run overlay inside the existing shell rather than a separate screen;
  - can be reopened from Settings.

## 4. Editor features

- Studio edits `.bks` files with **Monaco Editor**.
- BickSpec language support is registered for `.bks` files.
- Implemented syntax highlighting includes:
  - keywords such as `IMPORT`, `PROJECT`, `FX`, `READ`, `DISPLAY`, `IF`, `THEN`, `ELSE`, `WHILE`, `FUNCTION`;
  - booleans;
  - built-ins such as `NPV` and `PAYBACK`;
  - currencies such as `USD`, `GTQ`, `EUR`;
  - numbers, strings, comments, operators, brackets, and delimiters.
- Implemented completion/snippet support includes:
  - a `PROJECT` starter snippet;
  - `DISPLAY`, `READ`, assignment, `IF`, `WHILE`, `FUNCTION`, `NPV`, `PAYBACK`, and `IMPORT` snippets;
  - keyword completions and currency tokens.
- Workspace/editor behavior includes:
  - new `.bks` file creation;
  - opening `.bks` files;
  - opening folders;
  - explorer tree over the active filesystem workspace;
  - editor tabs;
  - switching tabs;
  - saving files;
  - closing tabs with dirty-file prompts;
  - recent file/folder persistence.
- The File and Edit menus are wired to real actions. Edit operations include undo, redo, cut, copy, paste, and select all, with Monaco-specific handling when the editor is active.

## 5. Compiler integration

- Studio resolves the linked `bickspec-lang` repository through `CompilerRepositoryResolver`.
- Repository validation checks for signals including:
  - `app/pom.xml`;
  - `app/target`;
  - `docs/BickSpec.g4`;
  - known compiler artifacts under `app/target`.
- The setup wizard adds stricter repository-root checks for `app/pom.xml` and `app/src`, rejects obvious subfolders, and can either browse to an existing repo or clone from GitHub.
- Compiler artifact resolution checks for known JAR names such as:
  - `bickspec-compiler-1.0.0.jar`;
  - other matching `bickspec-*.jar` files in `app/target`.
- Real compiler execution is performed in the main process with:
  - `java -jar <artifact> <targetPath>`.
- Before execution, Studio verifies:
  - linked repository validity;
  - resolved compiler artifact existence;
  - target existence.
- Compiler output is parsed and then normalized into:
  - raw compiler output;
  - structured build log;
  - program output;
  - interactive output.
- The renderer is intentionally kept out of raw compiler-output parsing.

## 6. Output panels

The bottom session panel has four tabs:

### Interactive
- Used for live stdin/stdout sessions when a source file contains `READ`.
- Shows a transcript of program output and user input.

### Program Output
- Shows runtime output for non-interactive runs.
- The display layer formats numeric runtime-only lines for readability.
- It is distinct from compiler logs and diagnostics.

### Errors
- Shows structured diagnostics.
- If there are no diagnostics, the empty state is `No errors detected.`

### Build Log
- Shows structured compiler/build pipeline lines, including tagged lines such as:
  - `[STATUS]`
  - `[SYMBOLS]`
  - `[TREE]`
  - `[JAVA]`
  - `[ACTION]`
  - `[BUILD]`
  - `[EXECUTION]`
  - `[SUMMARY]`
  - `[JAVAC]`

## 7. Diagnostics

- Implemented diagnostic categories:
  - `LEX` → Lexical
  - `SYN` → Syntax
  - `SEM` → Semantic
  - `GEN` → Generation
  - `BUILD` → Build
  - `EXECUTION` → Runtime
  - `FS` → File System
  - `LINK` → Compiler Link
  - `OTHER` → Error
- Classification uses diagnostic-code prefixes first, then text patterns as fallback.
- The diagnostics UI uses distinct icons:
  - `LEX`: hash/token-style icon
  - `SYN`: braces icon
  - `SEM`: alert icon
  - `GEN`: sparkles icon
  - `BUILD`: hammer icon
  - `EXECUTION`: play icon
  - `FS`: file-warning icon
  - `LINK`: link icon
- Category-specific CSS classes are present (`diagnostic-lex`, `diagnostic-syn`, etc.); exact final colors are defined in theme CSS rather than in the diagnostic component itself.
- Implemented suggested fixes include:
  - lexical unsupported-character guidance;
  - syntax/braces/operator guidance;
  - semantic declaration/type guidance;
  - generation/build/runtime/filesystem/compiler-link guidance.

## 8. Interactive mode

- Studio detects interactive programs by scanning a source file for the `READ` keyword before execution.
- `READ` programs are launched with `child_process.spawn`, not `exec`.
- `InteractiveSessionManager` keeps a live child process, collects stdout/stderr incrementally, appends transcript entries, accepts input through `stdin.write(input + "\n")`, and tracks idle/waiting/completed/failed states.
- The renderer transcript:
  - separates `BickSpec Program` and `You` entries;
  - auto-scrolls to the latest message;
  - preserves a transcript after completion;
  - shows `Waiting for input...` or `Interactive session completed.` status text;
  - disables Send when no live session exists.
- Program output in interactive transcript entries is presentation-formatted for standalone numeric lines, including scientific notation such as `2.0E7` becoming `20,000,000.00`.

## 9. Artifacts

- `ArtifactDiscoveryService` derives artifacts from parsed compiler-output artifact lines.
- Supported artifact types include:
  - symbols CSV;
  - parse tree SVG;
  - parse tree DOT;
  - generated Java;
  - compiled class files;
  - summaries;
  - logs;
  - report-like files;
  - other files.
- Artifact metadata includes absolute path, project-relative path, display name, existence flag, modified time, size, and source tag.
- Artifact previews can be opened or revealed in the OS; readable artifacts can be previewed in the Results page.
- The discovery root is:
  - the execution target path for directory targets;
  - the compiler working directory for file targets.

## 10. Reports and exports

- **Report Preview** is implemented from the latest normalized compiler session, not mock portfolio content.
- Report data includes:
  - report ID;
  - title;
  - source file name/path;
  - generated timestamp;
  - status;
  - target kind;
  - diagnostics;
  - artifacts;
  - program output;
  - interactive transcript and entries;
  - build log.
- The report UI exposes:
  - Summary;
  - Program Output;
  - Diagnostics;
  - Artifacts;
  - Build Log.
- Export formats:
  - **PDF**: generated through an offscreen `BrowserWindow` and `webContents.printToPDF`;
  - **Excel**: generated with `xlsx`;
  - **CSV**: generated as UTF-8 text.
- Excel exports contain:
  - Summary;
  - Program Output or Interactive Transcript;
  - Diagnostics;
  - Artifacts;
  - Build Log.
- CSV exports flatten the same data into rows.
- Difference between UI output and export output:
  - UI may show boxed visual Program Output;
  - export helpers remove ASCII borders/title lines and export clean plain runtime lines instead;
  - interactive exports flatten transcript entries into clean role/content rows.

## 11. Settings

- Theme modes implemented:
  - `light`;
  - `dark`;
  - `system`.
- `system` follows `prefers-color-scheme` and updates when the OS color-scheme media query changes.
- Theme selection is persisted in `localStorage` under `bickspec.theme`.
- The Settings page has local persistence through the renderer service layer; `mockServices.settings` reads/writes `bickspec-studio-settings` in `localStorage`.
- Compiler/setup information shown in Settings includes:
  - selected Java path;
  - compiler repository path;
  - compiler JAR path;
  - setup workspace path;
  - open/reset setup wizard controls.
- Workspace state and recent entries are persisted separately by the main-process workspace service in Electron user-data JSON.
- Some settings controls are intentionally fixed/disabled in the current build, such as project launch behavior, editor font, line numbers, technical density, and open-results-after-compile.

## 12. Branding

- The approved visual identity is **Spec Grid**.
- The README describes the brand direction as:
  - structural/specification-led;
  - navy and teal palette;
  - Sora for interface typography;
  - IBM Plex Mono for code, console, and technical output.
- Approved assets are present in `designs/brand` and mirrored for runtime use in `src/assets/brand`.
- Brand assets include:
  - light/dark icons;
  - light/dark logos;
  - transparent logo variants;
  - a brand reference screen image.
- The renderer uses the official brand assets through the `BrandLogo` component.

## 13. Setup wizard

- The setup wizard is implemented as a first-run overlay and can be reopened from Settings.
- Persisted setup state includes:
  - completion/skipped flags;
  - Java path;
  - optional compiler repo path;
  - compiler JAR path;
  - compiler source;
  - workspace path;
  - output directory;
  - last validation results;
  - completion timestamp.
- Implemented steps:
  1. Welcome
  2. Java Runtime
  3. Compiler
  4. Workspace
  5. Run Test Compilation
  6. Interactive Mode
  7. Artifacts & Reports
  8. Ready
- Java validation:
  - runs `java -version`;
  - treats Java 21 as recommended;
  - warns rather than automatically failing for a different detected version.
- Advanced compiler repository validation:
  - supports browsing to an existing local checkout;
  - supports cloning from GitHub;
  - validates root structure;
  - rejects obvious subfolders;
  - can safely update an existing repository only when the user asks and no local changes are present.
- Compiler JAR validation:
  - prefers the bundled Studio compiler JAR;
  - checks for a `.jar` file;
  - records the chosen artifact path;
  - supports custom JAR overrides;
  - supports Maven build from repository using `mvn -f app/pom.xml package` as a developer option.
- Workspace validation:
  - verifies an existing directory;
  - writes into `.bickspec/setup` to test writability;
  - records discovered `.bks` count.
- Test compilation:
  - writes a real setup test file under `.bickspec/setup`;
  - runs the real compiler;
  - expects actual runtime output containing `Resultado:` and `5.2`.
- Interactive test:
  - writes a real `READ`-based setup test;
  - starts the existing interactive session flow;
  - exposes live transcript/input in the wizard.
- Artifacts/reports validation:
  - checks discovered real artifacts from the latest compiler session;
  - checks report-export readiness;
  - can create PDF, Excel, and CSV test exports in a user-selected directory.

## Notes on partially implemented or legacy surfaces

- The renderer `mockServices` module still exists and is used for local Settings persistence; it also contains older mock-shaped service interfaces/data for compiler/projects/artifacts/reports. The main runtime workspace/compiler/report flows described above are wired through Electron backend services instead.
- The Welcome-page “Code Preview” panel is static illustrative content, not a live compiler/editor view.
